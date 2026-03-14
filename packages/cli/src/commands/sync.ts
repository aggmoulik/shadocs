import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'
import { fetchRegistry, resolveAllItems } from '../registry/fetcher.js'
import { collectShadcnDeps, fetchShadcnComponents } from '../generator/component-writer.js'
import { writeComponentFiles, writeExampleManifest } from '../generator/component-writer.js'
import { writeBlockFiles } from '../generator/block-writer.js'
import { syncSite } from '../generator/site-generator.js'
import { log } from '../utils/logger.js'
import type { ResolvedRegistryData } from './init.js'

export async function sync(options: { cwd?: string } = {}) {
  const cwd = options.cwd || process.cwd()

  // Read existing config to know which sites exist
  const dataPath = resolve(cwd, 'shadocs.json')
  if (!existsSync(dataPath)) {
    log.error('shadocs.json not found. Run `npx @aggmoulik/shadocs init <source>` first.')
    process.exit(1)
  }

  const oldData: ResolvedRegistryData = JSON.parse(await readFile(dataPath, 'utf-8'))

  // Re-fetch registry
  const spinner = ora(`Re-fetching registry from ${oldData.name}...`).start()

  // Try to get source from config file
  let source = ''
  const configPath = resolve(cwd, 'shadocs.config.ts')
  if (existsSync(configPath)) {
    const configContent = await readFile(configPath, 'utf-8')
    const sourceMatch = configContent.match(/"source":\s*"([^"]+)"/)
    if (sourceMatch) {
      source = sourceMatch[1]
    }
  }

  if (!source) {
    spinner.fail('Could not determine registry source. Re-run init instead.')
    process.exit(1)
  }

  let registry, baseUrl
  try {
    const result = await fetchRegistry(source)
    registry = result.registry
    baseUrl = result.baseUrl
    spinner.succeed(`Found registry: ${registry.name} (${registry.items.length} items)`)
  } catch (e) {
    spinner.fail('Failed to fetch registry')
    log.error(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  // Resolve items
  const resolveSpinner = ora('Resolving items...').start()
  const resolvedItems = await resolveAllItems(registry, baseUrl, {
    concurrency: 10,
    onProgress: (done, total, name) => {
      resolveSpinner.text = `Resolving items (${done}/${total}): ${name}`
    },
  })
  resolveSpinner.succeed(`Resolved ${resolvedItems.length} items`)

  // Fetch shadcn deps
  const tempData = {
    name: registry.name,
    homepage: registry.homepage,
    items: resolvedItems,
    shadcnDeps: {} as Record<string, string>,
    resolvedAt: '',
  }
  const shadcnNeeded = collectShadcnDeps(tempData)

  let shadcnDeps: Record<string, string> = {}
  if (shadcnNeeded.length > 0) {
    const shadcnSpinner = ora(`Fetching ${shadcnNeeded.length} shadcn/ui dependencies...`).start()
    try {
      const components = await fetchShadcnComponents(shadcnNeeded)
      shadcnDeps = Object.fromEntries(components)
      shadcnSpinner.succeed(`Fetched ${components.size} shadcn/ui components`)
    } catch (e) {
      shadcnSpinner.warn(`Could not fetch some shadcn/ui dependencies: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Save updated data
  const data: ResolvedRegistryData = {
    name: registry.name,
    homepage: registry.homepage,
    items: resolvedItems,
    shadcnDeps,
    resolvedAt: new Date().toISOString(),
  }
  await writeFile(dataPath, JSON.stringify(data, null, 2))
  log.success('Updated shadocs.json')

  // Sync each existing site directory
  const docsDir = resolve(cwd, 'docs')
  const landingDir = resolve(cwd, 'landing')

  if (existsSync(docsDir)) {
    console.log()
    log.info('Syncing docs site...')
    await syncSite({
      siteDir: docsDir,
      data,
      writeFiles: async (siteDir, data) => {
        const shadcnComponents = new Map(Object.entries(data.shadcnDeps || {}))
        await writeComponentFiles(siteDir, data, shadcnComponents)
        await writeExampleManifest(siteDir, data)
      },
    })
  }

  if (existsSync(landingDir)) {
    console.log()
    log.info('Syncing landing page...')
    await syncSite({
      siteDir: landingDir,
      data,
      writeFiles: writeBlockFiles,
    })
  }

  console.log()
  log.success('Registry data synced successfully!')
}
