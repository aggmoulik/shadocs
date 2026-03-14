import { existsSync } from 'node:fs'
import { readFile, cp, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import ora from 'ora'
import { log } from '../utils/logger.js'
import type { ResolvedRegistryData } from '../commands/init.js'
import { collectNpmDependencies } from './component-writer.js'

export interface SiteGeneratorOptions {
  cwd: string
  /** Which template package to use */
  templateName: 'template' | 'landing-template'
  /** Subdirectory under .shadocs/ */
  siteDirName: 'site' | 'landing'
  /** Callback to write component/block files into the site dir */
  writeFiles: (siteDir: string, data: ResolvedRegistryData) => Promise<void>
  /** Additional npm deps to install (collected by the caller) */
  extraDeps?: string[]
}

/**
 * Shared site preparation logic used by both docs and landing commands.
 * Handles: read data → copy template → inject data → write files → install deps.
 */
export async function prepareSite(options: SiteGeneratorOptions): Promise<{
  siteDir: string
  data: ResolvedRegistryData
}> {
  const { cwd, templateName, siteDirName, writeFiles, extraDeps = [] } = options

  // 1. Check shadocs.json exists
  const dataPath = resolve(cwd, 'shadocs.json')
  if (!existsSync(dataPath)) {
    log.error('shadocs.json not found. Run `npx @aggmoulik/shadocs init <source>` first.')
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
    resolve(dirname(fileURLToPath(import.meta.url)), `../../${templateName}`),
    resolve(dirname(fileURLToPath(import.meta.url)), `../../../${templateName}`),
    resolve(dirname(fileURLToPath(import.meta.url)), `../../packages/${templateName}`),
  ]
  const templateDir = possibleTemplatePaths.find((p) => existsSync(p)) || possibleTemplatePaths[0]

  if (!existsSync(templateDir)) {
    templateSpinner.fail(`Site template "${templateName}" not found. This is a bug — please report it.`)
    process.exit(1)
  }

  const siteDir = resolve(buildDir, siteDirName)
  // Clean previous site dir to avoid stale files and symlink copy issues
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

  // 4. Inject registry data
  const injectSpinner = ora('Injecting registry data...').start()
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))
  injectSpinner.succeed('Injected registry data')

  // 5. Write component/block files
  const writeSpinner = ora('Writing component files...').start()
  await writeFiles(siteDir, data)
  writeSpinner.succeed('Wrote component files')

  // 6. Install dependencies
  const installSpinner = ora('Installing dependencies...').start()
  try {
    const { dependencies } = collectNpmDependencies(data)
    const allDeps = [...new Set([...dependencies, ...extraDeps])]

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

  return { siteDir, data }
}
