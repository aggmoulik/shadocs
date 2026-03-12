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
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
  meta?: Record<string, unknown>
}

export interface RegistryData {
  name: string
  homepage: string
  items: RegistryItem[]
  resolvedAt: string
}

export const registry = data as RegistryData

/** Component types that are shown as browsable items */
const COMPONENT_TYPES = new Set([
  'registry:ui',
  'registry:component',
  'registry:hook',
  'registry:block',
])

/** Get all component items (ui, component, hook, block — not examples, styles, libs) */
export function getComponents(): RegistryItem[] {
  return registry.items.filter((item) => COMPONENT_TYPES.has(item.type))
}

/** Get a single item by name (searches all items including examples) */
export function getItem(name: string): RegistryItem | undefined {
  return registry.items.find((item) => item.name === name)
}

/**
 * Find example items that demonstrate a given component.
 * Matches by naming convention (e.g. "magic-card-demo" for "magic-card")
 * or by registryDependencies.
 */
export function getExamplesForItem(itemName: string): RegistryItem[] {
  return registry.items.filter((item) => {
    if (item.type !== 'registry:example') return false
    if (item.name.startsWith(`${itemName}-demo`)) return true
    if (item.registryDependencies?.some((dep) => dep.endsWith(`/${itemName}`) || dep === itemName)) return true
    return false
  })
}

/** Format type label for display */
export function formatType(type: string): string {
  const raw = type.replace('registry:', '')
  if (raw === 'ui') return 'Component'
  return raw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
