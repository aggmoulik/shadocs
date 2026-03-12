import { z } from 'zod'
import { registrySchema, registryItemSchema, type Registry, type RegistryItem } from './validator.js'

/**
 * Fetch a shadcn-compatible registry.
 *
 * @param source - Direct URL to a registry.json file (e.g. https://magicui.design/r/registry.json)
 *                 or a relative/absolute path to a local registry.json file.
 */
export async function fetchRegistry(source: string): Promise<{ registry: Registry; baseUrl: string }> {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return fetchRemoteRegistry(source)
  }
  return fetchLocalRegistry(source)
}

/**
 * Derive the base URL for resolving individual items from the registry.json URL.
 * e.g. https://magicui.design/r/registry.json → https://magicui.design
 */
function deriveBaseUrl(registryJsonUrl: string): string {
  const url = new URL(registryJsonUrl)
  // Strip the path to get the origin (e.g. https://magicui.design)
  // The item resolver will try patterns like {baseUrl}/r/{name}.json
  return url.origin
}

async function fetchRemoteRegistry(registryJsonUrl: string): Promise<{ registry: Registry; baseUrl: string }> {
  const response = await fetch(registryJsonUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${registryJsonUrl}: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()
  const baseUrl = deriveBaseUrl(registryJsonUrl)

  // Handle array format (shadcn/ui style: just an array of items at /r/index.json)
  if (Array.isArray(json)) {
    const items = z.array(registryItemSchema).parse(json)
    const hostname = new URL(baseUrl).hostname.replace('www.', '')
    const name = hostname.split('.')[0]
    const registry: Registry = {
      name,
      homepage: baseUrl,
      items,
    }
    return { registry, baseUrl }
  }

  // Handle object format (standard: { name, homepage, items })
  const registry = registrySchema.parse(json)
  return { registry, baseUrl }
}

async function fetchLocalRegistry(path: string): Promise<{ registry: Registry; baseUrl: string }> {
  const fs = await import('node:fs/promises')
  const { resolve, dirname } = await import('node:path')

  const resolvedPath = resolve(path)
  const content = await fs.readFile(resolvedPath, 'utf-8')
  const json = JSON.parse(content)

  // Handle array format
  if (Array.isArray(json)) {
    const items = z.array(registryItemSchema).parse(json)
    const registry: Registry = {
      name: 'registry',
      homepage: '',
      items,
    }
    return { registry, baseUrl: `file://${dirname(resolvedPath)}` }
  }

  const registry = registrySchema.parse(json)
  return { registry, baseUrl: `file://${dirname(resolvedPath)}` }
}

/**
 * Resolve a single registry item by fetching its full data (including file contents)
 * from the registry's base URL.
 */
export async function resolveItem(
  item: RegistryItem,
  baseUrl: string
): Promise<RegistryItem> {
  // If files already have content, no need to resolve
  const needsResolving = !item.files?.length || item.files.some((f) => !f.content)

  // Local files can't be resolved remotely
  if (!needsResolving || baseUrl.startsWith('file://')) {
    return item
  }

  // Try multiple URL patterns — registries serve items differently
  const urlPatterns = [
    `${baseUrl}/r/${item.name}.json`,
    `${baseUrl}/r/styles/new-york/${item.name}.json`,
    `${baseUrl}/r/styles/default/${item.name}.json`,
  ]

  for (const itemUrl of urlPatterns) {
    try {
      const response = await fetch(itemUrl)
      if (!response.ok) continue

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('json')) continue

      const json = await response.json()
      const resolved = registryItemSchema.parse(json)

      // Merge: keep original metadata, take resolved files
      return {
        ...item,
        ...resolved,
        title: resolved.title || item.title,
        description: resolved.description || item.description,
        docs: resolved.docs || item.docs,
        categories: resolved.categories?.length ? resolved.categories : item.categories,
      }
    } catch {
      continue // Try next URL pattern
    }
  }

  return item // Return unresolved if all patterns fail
}

/**
 * Resolve all items in a registry, fetching file contents in parallel.
 * Returns items with file contents populated where possible.
 */
export async function resolveAllItems(
  registry: Registry,
  baseUrl: string,
  options: {
    concurrency?: number
    onProgress?: (resolved: number, total: number, name: string) => void
  } = {}
): Promise<RegistryItem[]> {
  const { concurrency = 10, onProgress } = options
  const items = [...registry.items]
  const results: RegistryItem[] = []
  let resolved = 0

  // Process in batches for controlled concurrency
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const result = await resolveItem(item, baseUrl)
        resolved++
        onProgress?.(resolved, items.length, item.name)
        return result
      })
    )
    results.push(...batchResults)
  }

  return results
}
