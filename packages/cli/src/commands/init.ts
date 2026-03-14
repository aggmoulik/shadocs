import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'
import * as p from '@clack/prompts'
import { fetchRegistry, resolveAllItems } from '../registry/fetcher.js'
import type { RegistryItem } from '../registry/validator.js'
import { createDefaultConfig } from '../config/defaults.js'
import { generateConfigFile } from '../config/schema.js'
import type { SiteType } from '../config/schema.js'
import { collectShadcnDeps, fetchShadcnComponents } from '../generator/component-writer.js'
import { scaffoldSite } from '../generator/site-generator.js'
import { writeComponentFiles, writeExampleManifest } from '../generator/component-writer.js'
import { writeBlockFiles } from '../generator/block-writer.js'
import { log } from '../utils/logger.js'

export interface ResolvedRegistryData {
  name: string
  homepage: string
  items: RegistryItem[]
  /** shadcn/ui base components needed by examples (name -> source code) */
  shadcnDeps: Record<string, string>
  resolvedAt: string
}

export async function init(
  source: string,
  options: {
    cwd?: string
    template?: string
    yes?: boolean
  } = {}
) {
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

  // 3. Fetch shadcn/ui base dependencies
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
      shadcnSpinner.succeed(`Fetched ${components.size} shadcn/ui components: ${[...components.keys()].join(', ')}`)
    } catch (e) {
      shadcnSpinner.warn(`Could not fetch some shadcn/ui dependencies: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 4. Save resolved data
  const data: ResolvedRegistryData = {
    name: registry.name,
    homepage: registry.homepage,
    items: resolvedItems,
    shadcnDeps,
    resolvedAt: new Date().toISOString(),
  }

  const dataPath = resolve(cwd, 'shadocs.json')
  await writeFile(dataPath, JSON.stringify(data, null, 2))
  log.success(`Saved registry data to shadocs.json`)

  // 5. Registry summary
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

  const hasBlocks = typeGroups.has('block')

  // 6. Interactive site selection (unless --yes)
  let selectedSites: SiteType[]
  let docsTemplate: string | undefined
  let landingTemplate: string | undefined

  if (options.yes) {
    selectedSites = hasBlocks ? ['docs', 'landing'] : ['docs']
  } else {
    console.log()
    p.intro('Configure your sites')

    const siteChoices: { value: SiteType; label: string; hint?: string }[] = [
      { value: 'docs', label: 'Documentation site', hint: 'Component docs with code previews' },
    ]
    if (hasBlocks) {
      siteChoices.push({
        value: 'landing',
        label: 'Landing page',
        hint: 'Block showcase with live previews & theme editor',
      })
    }

    const sites = await p.multiselect({
      message: 'Which sites would you like to generate?',
      options: siteChoices,
      initialValues: hasBlocks ? ['docs' as SiteType, 'landing' as SiteType] : ['docs' as SiteType],
      required: true,
    })

    if (p.isCancel(sites)) {
      p.cancel('Cancelled')
      process.exit(0)
    }

    selectedSites = sites as SiteType[]

    // Ask for custom templates
    if (selectedSites.includes('docs')) {
      const customDocs = await p.confirm({
        message: 'Use a custom docs template? (default: shadocs built-in)',
        initialValue: false,
      })
      if (p.isCancel(customDocs)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      if (customDocs) {
        const url = await p.text({
          message: 'Enter docs template URL (git URL or local path):',
          placeholder: 'https://github.com/user/my-docs-template.git',
          validate: (v) => !v || v.length === 0 ? 'Template URL is required' : undefined,
        })
        if (p.isCancel(url)) {
          p.cancel('Cancelled')
          process.exit(0)
        }
        docsTemplate = url
      }
    }

    if (selectedSites.includes('landing')) {
      const customLanding = await p.confirm({
        message: 'Use a custom landing template? (default: shadocs built-in)',
        initialValue: false,
      })
      if (p.isCancel(customLanding)) {
        p.cancel('Cancelled')
        process.exit(0)
      }
      if (customLanding) {
        const url = await p.text({
          message: 'Enter landing template URL (git URL or local path):',
          placeholder: 'https://github.com/user/my-landing-template.git',
          validate: (v) => !v || v.length === 0 ? 'Template URL is required' : undefined,
        })
        if (p.isCancel(url)) {
          p.cancel('Cancelled')
          process.exit(0)
        }
        landingTemplate = url
      }
    }

    p.outro('Starting site generation...')
  }

  // Use --template flag as override for single-site or docs template
  if (options.template) {
    if (selectedSites.includes('docs') && !docsTemplate) {
      docsTemplate = options.template
    } else if (selectedSites.includes('landing') && !landingTemplate) {
      landingTemplate = options.template
    }
  }

  // 7. Create config
  const templates = (docsTemplate || landingTemplate)
    ? { docs: docsTemplate, landing: landingTemplate }
    : undefined

  const config = createDefaultConfig({
    source,
    registryName: registry.name,
    homepage: registry.homepage,
    sites: selectedSites,
    templates,
  })
  const configPath = resolve(cwd, 'shadocs.config.ts')
  await writeFile(configPath, generateConfigFile(config))
  log.success(`Created shadocs.config.ts`)

  // 8. Scaffold selected sites
  console.log()

  if (selectedSites.includes('docs')) {
    log.info('Scaffolding docs site...')
    await scaffoldSite({
      cwd,
      siteType: 'docs',
      dirName: 'docs',
      templateSource: docsTemplate,
      data,
      writeFiles: async (siteDir, data) => {
        const shadcnComponents = new Map(Object.entries(data.shadcnDeps || {}))
        await writeComponentFiles(siteDir, data, shadcnComponents)
        await writeExampleManifest(siteDir, data)
      },
    })
    console.log()
  }

  if (selectedSites.includes('landing')) {
    log.info('Scaffolding landing page...')
    await scaffoldSite({
      cwd,
      siteType: 'landing',
      dirName: 'landing',
      templateSource: landingTemplate,
      data,
      writeFiles: writeBlockFiles,
    })
    console.log()
  }

  // 9. Create root .gitignore if it doesn't exist
  const gitignorePath = resolve(cwd, '.gitignore')
  if (!existsSync(gitignorePath)) {
    const gitignoreLines = [
      '# shadocs cache',
      '.shadocs/',
      '',
      '# build output',
      'out/',
      'out-landing/',
      '',
      '# dependencies (in site dirs)',
      'docs/node_modules/',
      'docs/.next/',
      'docs/*.tsbuildinfo',
      'docs/next-env.d.ts',
      'landing/node_modules/',
      'landing/.next/',
      'landing/*.tsbuildinfo',
      'landing/next-env.d.ts',
      '',
      '# env',
      '.env',
      '.env*.local',
      '',
      '# misc',
      '.DS_Store',
      '',
    ]
    await writeFile(gitignorePath, gitignoreLines.join('\n'))
    log.success('Created .gitignore')
  }

  // 10. Final summary
  log.success('Project initialized!')
  console.log()
  log.info('Next steps:')
  if (selectedSites.includes('docs')) {
    log.dim('  npx @aggmoulik/shadocs docs dev       — Start docs dev server')
    log.dim('  npx @aggmoulik/shadocs docs build     — Build docs static site')
  }
  if (selectedSites.includes('landing')) {
    log.dim('  npx @aggmoulik/shadocs landing dev    — Start landing dev server')
    log.dim('  npx @aggmoulik/shadocs landing build  — Build landing static site')
  }
  log.dim('  npx @aggmoulik/shadocs sync           — Update registry data without re-scaffolding')
  console.log()
  log.dim('  Tip: Install globally to use "shadocs" directly:')
  log.dim('  npm install -g @aggmoulik/shadocs')
}
