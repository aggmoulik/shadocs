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

const REPO = 'aggmoulik/shadocs'
const BRANCH = 'main'

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
 * Find template locally (monorepo dev) or download from GitHub.
 */
async function resolveTemplate(
  templateName: string,
  cacheDir: string,
  spinner: ReturnType<typeof ora>,
): Promise<string> {
  // Check local monorepo paths first (for development)
  const cliRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const localPaths = [
    resolve(cliRoot, `../${templateName}`),
    resolve(cliRoot, `../../${templateName}`),
    resolve(cliRoot, `../../packages/${templateName}`),
  ]
  const localDir = localPaths.find((p) => existsSync(join(p, 'package.json')))
  if (localDir) return localDir

  // Download from GitHub
  const cachedDir = resolve(cacheDir, templateName)
  if (existsSync(join(cachedDir, 'package.json'))) {
    return cachedDir
  }

  spinner.text = `Downloading ${templateName} from GitHub...`

  const tarUrl = `https://codeload.github.com/${REPO}/tar.gz/${BRANCH}`
  const tarPath = resolve(cacheDir, `${templateName}.tar.gz`)
  await mkdir(cacheDir, { recursive: true })

  // Download tarball
  const res = await fetch(tarUrl)
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download template: ${res.status} ${res.statusText}`)
  }
  const fileStream = createWriteStream(tarPath)
  await pipeline(res.body as unknown as NodeJS.ReadableStream, fileStream)

  // Extract only the template subdirectory
  await mkdir(cachedDir, { recursive: true })
  execSync(
    `tar -xzf "${tarPath}" --strip-components=3 -C "${cachedDir}" "shadocs-${BRANCH}/packages/${templateName}"`,
    { stdio: 'pipe' },
  )

  // Clean up tarball
  await rm(tarPath, { force: true })

  if (!existsSync(join(cachedDir, 'package.json'))) {
    throw new Error(`Template "${templateName}" not found in downloaded archive`)
  }

  return cachedDir
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

  // 3. Resolve template (local or download from GitHub)
  const templateSpinner = ora('Resolving site template...').start()
  let templateDir: string
  try {
    templateDir = await resolveTemplate(templateName, resolve(buildDir, '.templates'), templateSpinner)
    templateSpinner.succeed('Resolved site template')
  } catch (err) {
    templateSpinner.fail(`Failed to resolve template "${templateName}": ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }

  // 4. Copy template to site directory
  const copySpinner = ora('Copying site template...').start()
  const siteDir = resolve(buildDir, siteDirName)
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
  copySpinner.succeed('Copied site template')

  // 5. Inject registry data
  const injectSpinner = ora('Injecting registry data...').start()
  const registryDataPath = resolve(siteDir, 'src/lib/registry-data.json')
  await mkdir(dirname(registryDataPath), { recursive: true })
  await writeFile(registryDataPath, JSON.stringify(data, null, 2))
  injectSpinner.succeed('Injected registry data')

  // 6. Write component/block files
  const writeSpinner = ora('Writing component files...').start()
  await writeFiles(siteDir, data)
  writeSpinner.succeed('Wrote component files')

  // 7. Install dependencies
  const installSpinner = ora('Installing dependencies...').start()
  try {
    // Read template's existing deps to avoid overwriting them
    const sitePkg = JSON.parse(await readFile(resolve(siteDir, 'package.json'), 'utf-8'))
    const existingDeps = new Set([
      ...Object.keys(sitePkg.dependencies || {}),
      ...Object.keys(sitePkg.devDependencies || {}),
    ])

    const { dependencies } = collectNpmDependencies(data)
    const allDeps = [...new Set([...dependencies, ...extraDeps])]
      .filter((dep) => !existingDeps.has(dep))

    // Install template deps first
    execSync('pnpm install', {
      cwd: siteDir,
      stdio: 'pipe',
    })

    // Then add extra component deps (only ones not already in the template)
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

  return { siteDir, data }
}
