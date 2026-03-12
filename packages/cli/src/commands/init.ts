import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'
import { fetchRegistry, resolveAllItems } from '../registry/fetcher.js'
import type { RegistryItem } from '../registry/validator.js'
import { createDefaultConfig } from '../config/defaults.js'
import { generateConfigFile } from '../config/schema.js'
import { log } from '../utils/logger.js'

export interface ResolvedRegistryData {
  name: string
  homepage: string
  items: RegistryItem[]
  resolvedAt: string
}

export async function init(source: string, options: { cwd?: string } = {}) {
  const cwd = options.cwd || process.cwd()

  // 1. Fetch registry
  const spinner = ora(`Fetching registry from ${source}`).start()
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

  // 2. Resolve all items (fetch file contents)
  const resolveSpinner = ora('Resolving items...').start()
  const resolvedItems = await resolveAllItems(registry, baseUrl, {
    concurrency: 10,
    onProgress: (done, total, name) => {
      resolveSpinner.text = `Resolving items (${done}/${total}): ${name}`
    },
  })

  const withContent = resolvedItems.filter(
    (item) => item.files?.some((f) => f.content)
  )
  resolveSpinner.succeed(
    `Resolved ${withContent.length}/${resolvedItems.length} items with source code`
  )

  // 3. Save resolved data
  const data: ResolvedRegistryData = {
    name: registry.name,
    homepage: registry.homepage,
    items: resolvedItems,
    resolvedAt: new Date().toISOString(),
  }

  const dataPath = resolve(cwd, 'shadocs.json')
  await writeFile(dataPath, JSON.stringify(data, null, 2))
  log.success(`Saved registry data to shadocs.json`)

  // 4. Create config file
  const config = createDefaultConfig(source, registry.name, registry.homepage)
  const configPath = resolve(cwd, 'shadocs.config.ts')
  await writeFile(configPath, generateConfigFile(config))
  log.success(`Created shadocs.config.ts`)

  // 5. Summary
  console.log()
  log.info('Registry summary:')

  const typeGroups = new Map<string, number>()
  for (const item of resolvedItems) {
    const type = item.type.replace('registry:', '')
    typeGroups.set(type, (typeGroups.get(type) || 0) + 1)
  }
  for (const [type, count] of typeGroups) {
    log.dim(`  ${type}: ${count}`)
  }

  console.log()
  log.info('Next steps:')
  log.dim('  shadocs dev    — Start dev server')
  log.dim('  shadocs build  — Build static site')
}
