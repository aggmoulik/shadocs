import { existsSync } from 'node:fs'
import { readFile, cp, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import ora from 'ora'
import { log } from '../utils/logger.js'
import type { ResolvedRegistryData } from './init.js'

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
  // Template is in the sibling package. In dev: ../../template, in dist: varies
  // Try multiple locations
  const possibleTemplatePaths = [
    resolve(dirname(fileURLToPath(import.meta.url)), '../../template'),        // from dist/
    resolve(dirname(fileURLToPath(import.meta.url)), '../../../template'),      // from dist/src/
    resolve(dirname(fileURLToPath(import.meta.url)), '../../packages/template'), // from monorepo root
  ]
  const templateDir = possibleTemplatePaths.find((p) => existsSync(p)) || possibleTemplatePaths[0]

  if (!existsSync(templateDir)) {
    templateSpinner.fail('Site template not found. This is a bug — please report it.')
    process.exit(1)
  }

  const siteDir = resolve(buildDir, 'site')
  await cp(templateDir, siteDir, { recursive: true })
  templateSpinner.succeed('Copied site template')

  // 4. Inject registry data into template
  const injectSpinner = ora('Injecting registry data...').start()
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))
  injectSpinner.succeed('Injected registry data')

  // 5. Install dependencies and build
  const buildSpinner = ora('Building site (this may take a moment)...').start()
  try {
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
    process.exit(1)
  }

  // 6. Copy output
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
