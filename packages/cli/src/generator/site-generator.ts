import { existsSync, createWriteStream } from 'node:fs'
import { readFile, cp, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { pipeline } from 'node:stream/promises'
import ora from 'ora'
import { log } from '../utils/logger.js'
import type { ResolvedRegistryData } from '../commands/init.js'
import { collectNpmDependencies } from './component-writer.js'

const DEFAULT_REPO = 'aggmoulik/shadocs'
const DEFAULT_BRANCH = 'main'

export interface ScaffoldOptions {
  cwd: string
  /** 'docs' or 'landing' */
  siteType: 'docs' | 'landing'
  /** Directory name to scaffold into (e.g. 'docs', 'landing') */
  dirName: string
  /** Custom template source: git URL, local path, or undefined for default */
  templateSource?: string
  /** Callback to write component/block files into the site dir */
  writeFiles: (siteDir: string, data: ResolvedRegistryData) => Promise<void>
  /** Registry data */
  data: ResolvedRegistryData
  /** Additional npm deps to install */
  extraDeps?: string[]
}

/**
 * Which template package to use for each site type.
 */
const TEMPLATE_PACKAGES: Record<string, string> = {
  docs: 'template',
  landing: 'landing-template',
}

/**
 * Resolve template from: local monorepo (dev), custom source, or GitHub default.
 */
async function resolveTemplate(
  siteType: string,
  templateSource: string | undefined,
  cacheDir: string,
  spinner: ReturnType<typeof ora>,
): Promise<string> {
  const templateName = TEMPLATE_PACKAGES[siteType]

  // 1. Check local monorepo paths (for development)
  const cliRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const localPaths = [
    resolve(cliRoot, `../${templateName}`),
    resolve(cliRoot, `../../${templateName}`),
    resolve(cliRoot, `../../packages/${templateName}`),
  ]
  const localDir = localPaths.find((p) => existsSync(join(p, 'package.json')))
  if (localDir) return localDir

  // 2. Custom template source (git URL or local path)
  if (templateSource) {
    if (existsSync(templateSource) && existsSync(join(templateSource, 'package.json'))) {
      return templateSource
    }

    // Git clone
    spinner.text = `Cloning template from ${templateSource}...`
    const cloneDir = resolve(cacheDir, `custom-${siteType}`)
    if (existsSync(cloneDir)) {
      await rm(cloneDir, { recursive: true, force: true })
    }
    await mkdir(cacheDir, { recursive: true })
    execSync(`git clone --depth 1 ${templateSource} "${cloneDir}"`, { stdio: 'pipe' })

    if (!existsSync(join(cloneDir, 'package.json'))) {
      throw new Error(`Cloned template does not contain a package.json`)
    }
    return cloneDir
  }

  // 3. Download default template from GitHub
  const cachedDir = resolve(cacheDir, templateName)
  if (existsSync(join(cachedDir, 'package.json'))) {
    return cachedDir
  }

  spinner.text = `Downloading ${templateName} from GitHub...`

  const tarUrl = `https://codeload.github.com/${DEFAULT_REPO}/tar.gz/${DEFAULT_BRANCH}`
  const tarPath = resolve(cacheDir, `${templateName}.tar.gz`)
  await mkdir(cacheDir, { recursive: true })

  const res = await fetch(tarUrl)
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download template: ${res.status} ${res.statusText}`)
  }
  const fileStream = createWriteStream(tarPath)
  await pipeline(res.body as unknown as NodeJS.ReadableStream, fileStream)

  await mkdir(cachedDir, { recursive: true })
  execSync(
    `tar -xzf "${tarPath}" --strip-components=3 -C "${cachedDir}" "shadocs-${DEFAULT_BRANCH}/packages/${templateName}"`,
    { stdio: 'pipe' },
  )

  await rm(tarPath, { force: true })

  if (!existsSync(join(cachedDir, 'package.json'))) {
    throw new Error(`Template "${templateName}" not found in downloaded archive`)
  }

  return cachedDir
}

/**
 * Scaffold a site template into the user's project directory.
 * The user OWNS this directory — they can modify it freely.
 */
export async function scaffoldSite(options: ScaffoldOptions): Promise<string> {
  const { cwd, siteType, dirName, templateSource, writeFiles, data, extraDeps = [] } = options

  const siteDir = resolve(cwd, dirName)

  // 1. Resolve template
  const templateSpinner = ora(`Resolving ${siteType} template...`).start()
  let templateDir: string
  try {
    const cacheDir = resolve(cwd, '.shadocs', '.templates')
    templateDir = await resolveTemplate(siteType, templateSource, cacheDir, templateSpinner)
    templateSpinner.succeed(`Resolved ${siteType} template`)
  } catch (err) {
    templateSpinner.fail(`Failed to resolve template: ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }

  // 2. Copy template to user's project directory
  const copySpinner = ora(`Scaffolding ${siteType} site into ./${dirName}/...`).start()
  if (existsSync(siteDir)) {
    await rm(siteDir, { recursive: true, force: true })
  }
  await cp(templateDir, siteDir, {
    recursive: true,
    filter: (src) => {
      const rel = src.slice(templateDir.length)
      return !rel.includes('node_modules') && !rel.includes('.next') && !rel.includes('.turbo')
    },
  })
  // Remove monorepo lockfile so pnpm generates a fresh standalone one
  const lockfile = resolve(siteDir, 'pnpm-lock.yaml')
  if (existsSync(lockfile)) {
    await rm(lockfile, { force: true })
  }
  copySpinner.succeed(`Scaffolded ${siteType} site into ./${dirName}/`)

  // 3. Inject registry data
  const injectSpinner = ora('Injecting registry data...').start()
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))
  injectSpinner.succeed('Injected registry data')

  // 4. Write component/block files
  const writeSpinner = ora('Writing component files...').start()
  await writeFiles(siteDir, data)
  writeSpinner.succeed('Wrote component files')

  // 5. Install dependencies
  const installSpinner = ora('Installing dependencies...').start()
  try {
    const sitePkg = JSON.parse(await readFile(resolve(siteDir, 'package.json'), 'utf-8'))
    const existingDeps = new Set([
      ...Object.keys(sitePkg.dependencies || {}),
      ...Object.keys(sitePkg.devDependencies || {}),
    ])

    const { dependencies } = collectNpmDependencies(data)
    const allDeps = [...new Set([...dependencies, ...extraDeps])]
      .filter((dep) => !existingDeps.has(dep))

    execSync('pnpm install', {
      cwd: siteDir,
      stdio: 'pipe',
    })

    if (allDeps.length > 0) {
      execSync(`pnpm add ${allDeps.join(' ')}`, {
        cwd: siteDir,
        stdio: 'pipe',
      })
    }

    installSpinner.succeed('Dependencies installed')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    installSpinner.fail(`Failed to install dependencies: ${msg}`)
    process.exit(1)
  }

  return siteDir
}

/**
 * Sync registry data into an existing user-owned site directory.
 * Only updates registry-data.json and component files — does NOT touch template files.
 */
export async function syncSite(options: {
  siteDir: string
  data: ResolvedRegistryData
  writeFiles: (siteDir: string, data: ResolvedRegistryData) => Promise<void>
}): Promise<void> {
  const { siteDir, data, writeFiles } = options

  // Update registry data
  const injectSpinner = ora('Updating registry data...').start()
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))
  injectSpinner.succeed('Updated registry data')

  // Re-write component files
  const writeSpinner = ora('Updating component files...').start()
  await writeFiles(siteDir, data)
  writeSpinner.succeed('Updated component files')

  // Install any new deps
  const installSpinner = ora('Checking for new dependencies...').start()
  try {
    const sitePkg = JSON.parse(await readFile(resolve(siteDir, 'package.json'), 'utf-8'))
    const existingDeps = new Set([
      ...Object.keys(sitePkg.dependencies || {}),
      ...Object.keys(sitePkg.devDependencies || {}),
    ])

    const { dependencies } = collectNpmDependencies(data)
    const newDeps = dependencies.filter((dep) => !existingDeps.has(dep))

    if (newDeps.length > 0) {
      execSync(`pnpm add ${newDeps.join(' ')}`, { cwd: siteDir, stdio: 'pipe' })
      installSpinner.succeed(`Installed ${newDeps.length} new dependencies`)
    } else {
      installSpinner.succeed('No new dependencies needed')
    }
  } catch {
    installSpinner.warn('Could not check dependencies')
  }
}
