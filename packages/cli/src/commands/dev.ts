import { existsSync } from 'node:fs'
import { readFile, cp, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, execSync } from 'node:child_process'
import ora from 'ora'
import { log } from '../utils/logger.js'
import type { ResolvedRegistryData } from './init.js'
import { writeComponentFiles, writeExampleManifest, collectNpmDependencies } from '../generator/component-writer.js'

export async function dev(options: { cwd?: string; port?: number } = {}) {
  const cwd = options.cwd || process.cwd()
  const port = options.port || 3000

  // 1. Check shadocs.json exists
  const dataPath = resolve(cwd, 'shadocs.json')
  if (!existsSync(dataPath)) {
    log.error('shadocs.json not found. Run `shadocs init <source>` first.')
    process.exit(1)
  }

  const spinner = ora('Reading registry data...').start()
  const data: ResolvedRegistryData = JSON.parse(await readFile(dataPath, 'utf-8'))
  spinner.succeed(`Loaded ${data.items.length} items from ${data.name}`)

  // 2. Prepare dev directory
  const buildDir = resolve(cwd, '.shadocs')
  await mkdir(buildDir, { recursive: true })

  // 3. Copy template
  const templateSpinner = ora('Setting up dev environment...').start()
  const possibleTemplatePaths = [
    resolve(dirname(fileURLToPath(import.meta.url)), '../../template'),
    resolve(dirname(fileURLToPath(import.meta.url)), '../../../template'),
    resolve(dirname(fileURLToPath(import.meta.url)), '../../packages/template'),
  ]
  const templateDir = possibleTemplatePaths.find((p) => existsSync(p)) || possibleTemplatePaths[0]

  if (!existsSync(templateDir)) {
    templateSpinner.fail('Site template not found. This is a bug — please report it.')
    process.exit(1)
  }

  const siteDir = resolve(buildDir, 'site')
  // Clean previous site dir to avoid stale files and symlink copy issues
  const { rm } = await import('node:fs/promises')
  if (existsSync(siteDir)) {
    await rm(siteDir, { recursive: true, force: true })
  }
  await cp(templateDir, siteDir, {
    recursive: true,
    filter: (src) => {
      // Skip node_modules and .next from previous builds
      const rel = src.slice(templateDir.length)
      return !rel.includes('node_modules') && !rel.includes('.next')
    },
  })

  // 4. Inject registry data
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))

  // 5. Write component source files for live preview
  const shadcnComponents = new Map(Object.entries(data.shadcnDeps || {}))
  await writeComponentFiles(siteDir, data, shadcnComponents)
  await writeExampleManifest(siteDir, data)
  templateSpinner.succeed(`Dev environment ready (${shadcnComponents.size} shadcn/ui deps)`)

  // 6. Install dependencies
  const installSpinner = ora('Installing dependencies...').start()
  try {
    // Collect additional npm deps from registry items
    const { dependencies } = collectNpmDependencies(data)
    // Also collect deps from shadcn/ui component source
    const shadcnNpmDeps = collectShadcnSourceDeps(shadcnComponents)
    const allDeps = [...new Set([...dependencies, ...shadcnNpmDeps])]

    if (allDeps.length > 0) {
      execSync(`pnpm add ${allDeps.join(' ')}`, {
        cwd: siteDir,
        stdio: 'pipe',
      })
    }

    execSync('pnpm install --frozen-lockfile 2>/dev/null || pnpm install', {
      cwd: siteDir,
      stdio: 'pipe',
    })
    installSpinner.succeed('Dependencies installed')
  } catch {
    installSpinner.fail('Failed to install dependencies')
    process.exit(1)
  }

  // 7. Start Next.js dev server
  console.log()
  log.info(`Starting dev server on http://localhost:${port}`)
  console.log()

  const child = spawn('pnpm', ['dev', '--port', String(port)], {
    cwd: siteDir,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })

  // Forward signals
  process.on('SIGINT', () => child.kill('SIGINT'))
  process.on('SIGTERM', () => child.kill('SIGTERM'))
}

/**
 * Extract npm dependencies from shadcn/ui component source code.
 */
function collectShadcnSourceDeps(components: Map<string, string>): string[] {
  const deps = new Set<string>()

  for (const [, source] of components) {
    const matches = source.matchAll(
      /from\s+["']([^"'.@/][^"']*|@[^/"']+\/[^"']+)["']/g
    )
    for (const m of matches) {
      const pkg = m[1]
      if (pkg.startsWith('.') || pkg.startsWith('@/')) continue
      if (pkg.startsWith('@')) {
        const parts = pkg.split('/')
        deps.add(`${parts[0]}/${parts[1]}`)
      } else {
        deps.add(pkg.split('/')[0])
      }
    }
  }

  const templateDeps = new Set([
    'react', 'react-dom', 'next', 'next-themes',
    'shiki', 'lucide-react', 'clsx', 'tailwind-merge',
  ])
  for (const d of templateDeps) deps.delete(d)

  return [...deps]
}
