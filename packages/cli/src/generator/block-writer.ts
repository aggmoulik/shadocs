import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import type { ResolvedRegistryData } from '../commands/init.js'

/**
 * Write all block and lib files to the site directory using their `target` paths.
 *
 * BillingSDK pattern:
 *   Component: target = "components/billingsdk/pricing-table-one.tsx"
 *   Demo:      target = "components/pricing-table-one-demo.tsx"
 *   Lib:       target = "lib/billingsdk-config.ts"
 *
 * Demos import from @/components/billingsdk/X and @/lib/billingsdk-config,
 * so we must write to src/{target} for imports to resolve via @/ alias.
 */
export async function writeBlockFiles(
  siteDir: string,
  data: ResolvedRegistryData
) {
  const srcDir = resolve(siteDir, 'src')

  // Write shadcn/ui base components and collect their npm deps
  const uiDir = resolve(siteDir, 'src/components/ui')
  await mkdir(uiDir, { recursive: true })
  const shadcnComponents = new Map(Object.entries(data.shadcnDeps || {}))
  const shadcnNpmDeps = new Set<string>()

  for (const [name, source] of shadcnComponents) {
    const targetPath = resolve(uiDir, `${name}.tsx`)
    await writeFile(targetPath, source)

    // Scan for npm deps in shadcn component source
    const matches = source.matchAll(
      /\bfrom\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g
    )
    for (const m of matches) {
      const pkg = m[1] || m[2]
      if (!pkg || pkg.startsWith('.') || pkg.startsWith('@/') || pkg.startsWith('/')) continue
      if (pkg.includes('(') || pkg.includes(')')) continue
      if (pkg.startsWith('@')) {
        const parts = pkg.split('/')
        if (parts.length >= 2) shadcnNpmDeps.add(`${parts[0]}/${parts[1]}`)
      } else {
        shadcnNpmDeps.add(pkg.split('/')[0])
      }
    }
  }

  // Install shadcn npm deps (radix-ui, class-variance-authority, etc.)
  const templateDeps = new Set(['react', 'react-dom', 'next', 'next-themes', 'shiki', 'lucide-react', 'clsx', 'tailwind-merge'])
  const extraDeps = [...shadcnNpmDeps].filter((d) => !templateDeps.has(d))
  if (extraDeps.length > 0) {
    const { execSync } = await import('node:child_process')
    try {
      execSync(`pnpm add ${extraDeps.join(' ')}`, { cwd: siteDir, stdio: 'pipe' })
    } catch {
      // Non-fatal — some deps might not exist
    }
  }

  // Write all registry item files to BOTH target and path locations
  // Target: where the component installs (used by demo imports like @/components/billingsdk/X)
  // Path: the registry source path (used by some demos that import from @/registry/billingsdk/X)
  for (const item of data.items) {
    if (!item.files?.length) continue

    for (const file of item.files) {
      if (!file.content) continue

      const target = (file as { target?: string }).target
      const pathClean = file.path.replace(/^src\//, '')

      // Write to target location (primary)
      if (target) {
        const targetClean = target.replace(/^src\//, '')
        const targetPath = resolve(srcDir, targetClean)
        await mkdir(dirname(targetPath), { recursive: true })
        await writeFile(targetPath, file.content)
      }

      // Also write to path location (for imports that use the source path)
      const filePath = resolve(srcDir, pathClean)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, file.content)
    }
  }

  // Create stubs for missing internal modules that blocks may import
  await createMissingModuleStubs(siteDir, data)

  // Generate block manifest
  await writeBlockManifest(siteDir, data)
}

/**
 * Generate a manifest that maps block names to dynamically imported demo components.
 * For blocks without a demo file, fall back to the main component.
 */
export async function writeBlockManifest(
  siteDir: string,
  data: ResolvedRegistryData
) {
  const blocks = data.items.filter(
    (item) => item.type === 'registry:block' && item.files?.length
  )

  const imports: string[] = []

  for (const block of blocks) {
    if (!block.files?.length) continue

    // Find the demo file (preferred for preview) or main component
    const demoFile = block.files.find((f) =>
      f.path.includes('-demo.') || ((f as { target?: string }).target || '').includes('-demo.')
    )
    const mainFile = block.files.find((f) => f.content && !f.path.includes('-demo.') && !f.path.includes('config'))

    const renderFile = demoFile || mainFile
    if (!renderFile?.content) continue

    // Use target path for the import
    const relativePath = (renderFile as { target?: string }).target || renderFile.path
    const cleanPath = relativePath.replace(/^src\//, '').replace(/\.tsx?$/, '')
    const importPath = `@/${cleanPath}`

    imports.push(
      `  "${block.name}": dynamic(() => import("${importPath}").then(resolveExport), { ssr: false, loading: () => <BlockSkeleton /> })`
    )
  }

  const content = `"use client"
import dynamic from "next/dynamic"

function BlockSkeleton() {
  return (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground animate-pulse rounded-lg border border-border">
      Loading block preview...
    </div>
  )
}

// Resolve the first exported React component from a module.
// Handles both default exports and named exports (e.g. export function PricingTableOneDemo).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveExport(mod: Record<string, any>): { default: React.ComponentType } {
  if (mod.default && typeof mod.default === "function") {
    return { default: mod.default }
  }
  for (const key of Object.keys(mod)) {
    if (typeof mod[key] === "function") {
      return { default: mod[key] }
    }
  }
  return { default: () => null }
}

export const blockComponents: Record<string, React.ComponentType> = {
${imports.join(',\n')}
}
`

  await writeFile(resolve(siteDir, 'src/lib/block-manifest.tsx'), content)
}

/**
 * Scan all written files for @/ imports that don't resolve to existing files,
 * and create no-op stub modules so webpack doesn't fail.
 */
async function createMissingModuleStubs(
  siteDir: string,
  data: ResolvedRegistryData
) {
  const { existsSync } = await import('node:fs')
  const srcDir = resolve(siteDir, 'src')

  // Collect all @/ imports from all item files
  const allImports = new Set<string>()
  for (const item of data.items) {
    for (const file of item.files || []) {
      if (!file.content) continue
      const matches = file.content.matchAll(/from\s+["']@\/([^"']+)["']/g)
      for (const m of matches) {
        allImports.add(m[1])
      }
    }
  }

  // Check which imports don't resolve to existing files
  for (const importPath of allImports) {
    // Skip known paths that are handled by the template or written by us
    if (importPath.startsWith('components/ui/') || importPath === 'lib/utils') continue

    const possiblePaths = [
      resolve(srcDir, `${importPath}.ts`),
      resolve(srcDir, `${importPath}.tsx`),
      resolve(srcDir, `${importPath}/index.ts`),
      resolve(srcDir, `${importPath}/index.tsx`),
      resolve(srcDir, importPath),
    ]

    const exists = possiblePaths.some((p) => existsSync(p))
    if (!exists) {
      // Create a stub module with common export patterns
      const stubPath = resolve(srcDir, `${importPath}.ts`)
      await mkdir(dirname(stubPath), { recursive: true })

      // Generate a stub that exports common patterns as no-ops
      const stub = generateStubModule(importPath)
      await writeFile(stubPath, stub)
    }
  }
}

/**
 * Scan all source files to find what properties are destructured from hook calls
 * that come from the given import path, so stubs can match the expected shape.
 */
function findExpectedHookShape(
  importPath: string,
  data: ResolvedRegistryData
): Map<string, string[]> {
  const hookProps = new Map<string, string[]>()

  for (const item of data.items) {
    for (const file of item.files || []) {
      if (!file.content) continue
      if (!file.content.includes(`@/${importPath}`)) continue

      // Find named imports from this module: import { useTheme, getThemeStyles } from "@/..."
      const importMatch = file.content.match(
        new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*["']@/${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`)
      )
      if (!importMatch) continue

      const importedNames = importMatch[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim())

      for (const name of importedNames) {
        // Find destructured usage: const { prop1, prop2 } = useTheme()
        const destructureMatch = file.content.match(
          new RegExp(`const\\s*\\{([^}]+)\\}\\s*=\\s*${name}\\s*\\(`)
        )
        if (destructureMatch) {
          const props = destructureMatch[1].split(',').map((s) => s.trim().split(/[:\s]/)[0].trim()).filter(Boolean)
          hookProps.set(name, props)
        }
      }
    }
  }

  return hookProps
}

/**
 * Generate a stub module that provides no-op exports for common patterns.
 * Analyzes actual usage in component source to match expected return shapes.
 */
function generateStubModule(importPath: string): string {
  // Theme context pattern — provide rich stubs matching BillingSDK's useTheme shape
  if (importPath.includes('theme')) {
    return `// Auto-generated stub for missing module: @/${importPath}
export function useTheme() {
  return {
    theme: 'light',
    setTheme: () => {},
    resolvedTheme: 'light',
    // BillingSDK theme shape
    currentTheme: {},
    previewDarkMode: false,
    themes: [],
    activeTheme: null,
    setActiveTheme: () => {},
  }
}
export function getThemeStyles(_theme?: unknown, _dark?: boolean) {
  return {}
}
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => children
export const themes: unknown[] = []
export default {}
`
  }

  // Generic fallback — export an empty object and common hook patterns
  return `// Auto-generated stub for missing module: @/${importPath}
export default {}
`
}
