import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import type { ResolvedRegistryData } from '../commands/init.js'
import type { RegistryItem } from '../registry/validator.js'

/**
 * Write all resolved component source files to the site directory
 * using their original file paths so that import aliases (@/) resolve correctly.
 *
 * Creates:
 *   src/{file.path}  (e.g. src/registry/magicui/magic-card.tsx)
 *   src/components/ui/{name}.tsx  (for shadcn/ui deps)
 */
export async function writeComponentFiles(
  siteDir: string,
  data: ResolvedRegistryData,
  shadcnComponents: Map<string, string> // name -> source code
) {
  const srcDir = resolve(siteDir, 'src')
  const uiDir = resolve(siteDir, 'src/components/ui')

  await mkdir(uiDir, { recursive: true })

  // Write all registry items (components, examples, hooks, libs, etc.)
  // using their original file.path which matches the import paths
  for (const item of data.items) {
    if (!item.files?.length) continue

    for (const file of item.files) {
      if (!file.content) continue

      // Use original path: e.g. "registry/magicui/magic-card.tsx"
      // This maps to src/registry/magicui/magic-card.tsx
      // Which is imported as @/registry/magicui/magic-card
      const targetPath = resolve(srcDir, file.path)
      await mkdir(dirname(targetPath), { recursive: true })
      await writeFile(targetPath, file.content)
    }
  }

  // Write shadcn/ui base components (button, card, input, etc.)
  for (const [name, source] of shadcnComponents) {
    const targetPath = resolve(uiDir, `${name}.tsx`)
    await writeFile(targetPath, source)
  }
}

/**
 * Generate a barrel file that maps example names to dynamic imports,
 * so the preview component can lazily load them.
 */
export async function writeExampleManifest(
  siteDir: string,
  data: ResolvedRegistryData
) {
  const examples = data.items.filter(
    (item) => item.type === 'registry:example' && item.files?.[0]?.content
  )

  const imports = examples.map((ex) => {
    // Use the original file path for the import
    // e.g. "registry/example/magic-card-demo.tsx" -> "@/registry/example/magic-card-demo"
    const importPath = ex.files![0].path.replace(/\.tsx?$/, '')
    return `  "${ex.name}": dynamic(() => import("@/${importPath}"), { ssr: false, loading: () => <PreviewSkeleton /> })`
  })

  const content = `import dynamic from "next/dynamic"

function PreviewSkeleton() {
  return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground animate-pulse">
      Loading preview...
    </div>
  )
}

export const exampleComponents: Record<string, React.ComponentType> = {
${imports.join(',\n')}
}
`

  await writeFile(resolve(siteDir, 'src/lib/example-manifest.tsx'), content)
}

/**
 * Collect all npm dependencies required by registry items.
 * Scans both the declared dependencies AND the actual import statements
 * in source files to catch undeclared dependencies.
 */
export function collectNpmDependencies(data: ResolvedRegistryData): {
  dependencies: string[]
  devDependencies: string[]
} {
  const deps = new Set<string>()
  const devDeps = new Set<string>()

  for (const item of data.items) {
    if (item.dependencies) {
      for (const dep of item.dependencies) deps.add(dep)
    }
    if (item.devDependencies) {
      for (const dep of item.devDependencies) devDeps.add(dep)
    }

    // Also scan source files for external imports
    for (const file of item.files || []) {
      if (!file.content) continue
      // Match: from "package" or import "package"
      const matches = file.content.matchAll(
        /\bfrom\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g
      )
      for (const m of matches) {
        const pkg = m[1] || m[2]
        // Skip relative, alias, and non-package imports
        if (!pkg || pkg.startsWith('.') || pkg.startsWith('@/') || pkg.startsWith('/')) continue
        // Skip Next.js route patterns like @app/(auth)
        if (pkg.includes('(') || pkg.includes(')')) continue
        if (pkg.startsWith('@')) {
          const parts = pkg.split('/')
          if (parts.length >= 2) deps.add(`${parts[0]}/${parts[1]}`)
        } else {
          deps.add(pkg.split('/')[0])
        }
      }
    }
  }

  // Remove deps already in the template
  const templateDeps = new Set([
    'react', 'react-dom', 'next', 'next-themes',
    'shiki', 'lucide-react', 'clsx', 'tailwind-merge',
  ])
  for (const d of templateDeps) {
    deps.delete(d)
    devDeps.delete(d)
  }

  return {
    dependencies: [...deps],
    devDependencies: [...devDeps],
  }
}

/**
 * Collect shadcn/ui component names that are imported by registry items
 * but not part of the registry itself.
 */
export function collectShadcnDeps(data: ResolvedRegistryData): string[] {
  const uiImports = new Set<string>()
  const registryNames = new Set(data.items.map((i) => i.name))

  for (const item of data.items) {
    for (const file of item.files || []) {
      const content = file.content || ''
      // Match imports like: from "@/components/ui/button"
      const matches = content.matchAll(
        /from\s+["']@\/components\/ui\/([^"']+)["']/g
      )
      for (const m of matches) {
        const name = m[1]
        // Only include if not already in the registry
        if (!registryNames.has(name)) {
          uiImports.add(name)
        }
      }
    }
  }

  return [...uiImports].sort()
}

/**
 * Fetch shadcn/ui base components by name from the shadcn registry.
 * Returns a Map of component name -> source code.
 */
export async function fetchShadcnComponents(
  names: string[]
): Promise<Map<string, string>> {
  const components = new Map<string, string>()

  for (const name of names) {
    // Try shadcn/ui URL patterns
    const urls = [
      `https://ui.shadcn.com/r/styles/new-york/${name}.json`,
      `https://ui.shadcn.com/r/styles/default/${name}.json`,
    ]

    for (const url of urls) {
      try {
        const response = await fetch(url)
        if (!response.ok) continue

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('json')) continue

        const json = await response.json()
        if (json.files?.[0]?.content) {
          // Rewrite internal shadcn import paths
          // e.g. @/registry/new-york/ui/button -> @/components/ui/button
          let content = json.files[0].content as string
          content = content.replace(
            /@\/registry\/(?:new-york|default)\/ui\//g,
            '@/components/ui/'
          )
          components.set(name, content)

          // Also collect sub-dependencies (shadcn components that depend on other shadcn components)
          const subDeps = json.registryDependencies || []
          for (const subDep of subDeps) {
            if (!components.has(subDep) && !names.includes(subDep)) {
              // Recursively fetch (simple approach - add to the map)
              const subResult = await fetchShadcnComponents([subDep])
              for (const [k, v] of subResult) components.set(k, v)
            }
          }
          break
        }
      } catch {
        continue
      }
    }
  }

  return components
}
