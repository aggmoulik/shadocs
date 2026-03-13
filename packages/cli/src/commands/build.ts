import { existsSync } from 'node:fs'
import { readFile, cp, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import ora from 'ora'
import { log } from '../utils/logger.js'
import type { ResolvedRegistryData } from './init.js'
import { writeComponentFiles, writeExampleManifest, collectNpmDependencies } from '../generator/component-writer.js'

export async function build(options: { cwd?: string } = {}) {
  const cwd = options.cwd || process.cwd()

  // 1. Check shadocs.json exists
  const dataPath = resolve(cwd, 'shadocs.json')
  if (!existsSync(dataPath)) {
    log.error('shadocs.json not found. Run `shadocs init <source>` first.')
    process.exit(1)
  }

  const spinner = ora('Reading registry data...').start()
  const data: ResolvedRegistryData = JSON.parse(await readFile(dataPath, 'utf-8'))
  spinner.succeed(`Loaded ${data.items.length} items from ${data.name}`)

  // 2. Prepare build directory
  const buildDir = resolve(cwd, '.shadocs')
  await mkdir(buildDir, { recursive: true })

  // 3. Copy template
  const templateSpinner = ora('Copying site template...').start()
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
      const rel = src.slice(templateDir.length)
      return !rel.includes('node_modules') && !rel.includes('.next')
    },
  })
  templateSpinner.succeed('Copied site template')

  // 4. Inject registry data into template
  const injectSpinner = ora('Injecting registry data...').start()
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))
  injectSpinner.succeed('Injected registry data')

  // 5. Write component source files for live preview
  const componentSpinner = ora('Writing component files for preview...').start()
  const shadcnComponents = new Map(Object.entries(data.shadcnDeps || {}))
  await writeComponentFiles(siteDir, data, shadcnComponents)
  await writeExampleManifest(siteDir, data)
  componentSpinner.succeed(`Wrote component files (${shadcnComponents.size} shadcn/ui deps)`)

  // 6. Install dependencies (including registry component deps)
  const buildSpinner = ora('Installing dependencies & building site...').start()
  try {
    // Collect additional npm deps from registry items
    const { dependencies } = collectNpmDependencies(data)
    // Also collect deps from shadcn/ui components
    const shadcnNpmDeps = await collectShadcnNpmDeps(shadcnComponents)
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
    execSync('pnpm build', { cwd: siteDir, stdio: 'pipe' })
    buildSpinner.succeed('Site built successfully')
  } catch (e) {
    buildSpinner.fail('Build failed')
    if (e instanceof Error && 'stdout' in e) {
      console.error((e as { stdout: Buffer }).stdout?.toString())
    }
    if (e instanceof Error && 'stderr' in e) {
      console.error((e as { stderr: Buffer }).stderr?.toString())
    }
    process.exit(1)
  }

  // 7. Copy output
  const outputDir = resolve(cwd, 'out')
  const nextOutDir = resolve(siteDir, 'out')
  if (existsSync(nextOutDir)) {
    await cp(nextOutDir, outputDir, { recursive: true })
    log.success(`Static site generated at ./out`)
  }

  console.log()
  log.info('Deploy the ./out directory to any static host:')
  log.dim('  Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.')
}

/**
 * Extract npm dependencies from shadcn/ui component source code.
 * These components import from packages like @radix-ui/*, class-variance-authority, etc.
 */
async function collectShadcnNpmDeps(components: Map<string, string>): Promise<string[]> {
  const deps = new Set<string>()

  for (const [, source] of components) {
    // Match imports from external packages (not @/ or ./ relative imports)
    const matches = source.matchAll(
      /from\s+["']([^"'.@/][^"']*|@[^/"']+\/[^"']+)["']/g
    )
    for (const m of matches) {
      const pkg = m[1]
      // Skip relative imports and @/ alias imports
      if (pkg.startsWith('.') || pkg.startsWith('@/')) continue
      // Get the package name (handle scoped packages)
      if (pkg.startsWith('@')) {
        const parts = pkg.split('/')
        deps.add(`${parts[0]}/${parts[1]}`)
      } else {
        deps.add(pkg.split('/')[0])
      }
    }
  }

  // Remove packages already in the template
  const templateDeps = new Set([
    'react', 'react-dom', 'next', 'next-themes',
    'shiki', 'lucide-react', 'clsx', 'tailwind-merge',
  ])
  for (const d of templateDeps) deps.delete(d)

  return [...deps]
}
