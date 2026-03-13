import data from './registry-data.json'

export interface RegistryFile {
  path: string
  content?: string
  type: string
  target?: string
}

export interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  author?: string
  docs?: string
  categories?: string[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
  meta?: Record<string, unknown>
}

export interface RegistryData {
  name: string
  homepage: string
  items: RegistryItem[]
  resolvedAt: string
}

export const registry = data as RegistryData

/** Get all block items */
export function getBlocks(): RegistryItem[] {
  return registry.items.filter((item) => item.type === 'registry:block' && item.files?.length)
}

/** Get a single block by name */
export function getBlock(name: string): RegistryItem | undefined {
  return registry.items.find((item) => item.name === name && item.type === 'registry:block')
}

/** Get unique categories across all blocks */
export function getBlockCategories(): string[] {
  const cats = new Set<string>()
  for (const block of getBlocks()) {
    for (const cat of block.categories || []) {
      cats.add(cat)
    }
  }
  return [...cats].sort()
}

/** Get the demo file for a block (the renderable preview) */
export function getBlockDemoFile(block: RegistryItem): RegistryFile | undefined {
  return block.files?.find((f) =>
    f.path.includes('-demo.') || (f.target && f.target.includes('-demo.'))
  )
}

/** Get the main component file for a block (not demo, not config) */
export function getBlockMainFile(block: RegistryItem): RegistryFile | undefined {
  return block.files?.find((f) =>
    f.content &&
    !f.path.includes('-demo.') &&
    !f.path.includes('config') &&
    !f.path.includes('validation')
  )
}

/** Format block name for display */
export function formatBlockName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
