import { z } from 'zod'

/**
 * Zod schemas matching the official shadcn registry format:
 * - https://ui.shadcn.com/schema/registry.json
 * - https://ui.shadcn.com/schema/registry-item.json
 */

/** Accept any registry:* type — real registries use types not in the official schema (e.g. registry:example) */
export const registryItemTypeEnum = z.string().refine(
  (val) => val.startsWith('registry:'),
  { message: 'Type must start with "registry:"' }
)

export type RegistryItemType = z.infer<typeof registryItemTypeEnum>

export const registryFileSchema = z.object({
  path: z.string(),
  content: z.string().optional(),
  type: registryItemTypeEnum,
  target: z.string().optional(),
}).passthrough()

export type RegistryFile = z.infer<typeof registryFileSchema>

const cssValueSchema: z.ZodType = z.union([
  z.string(),
  z.record(z.lazy(() => cssValueSchema)),
])

export const fontSchema = z.object({
  family: z.string(),
  provider: z.enum(['google']),
  import: z.string(),
  variable: z.string(),
  weight: z.array(z.string()).optional(),
  subsets: z.array(z.string()).optional(),
  selector: z.string().optional(),
})

export const registryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  type: registryItemTypeEnum,
  title: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryFileSchema).optional(),
  tailwind: z
    .object({
      config: z
        .object({
          content: z.array(z.string()).optional(),
          theme: z.record(z.unknown()).optional(),
          plugins: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  cssVars: z
    .object({
      theme: z.record(z.string()).optional(),
      light: z.record(z.string()).optional(),
      dark: z.record(z.string()).optional(),
    })
    .optional(),
  css: z.record(cssValueSchema).optional(),
  envVars: z.record(z.string()).optional(),
  meta: z.record(z.unknown()).optional(),
  extends: z.string().optional(),
  style: z.string().optional(),
  iconLibrary: z.string().optional(),
  baseColor: z.string().optional(),
  theme: z.string().optional(),
  font: fontSchema.optional(),
}).passthrough()

export type RegistryItem = z.infer<typeof registryItemSchema>

export const registrySchema = z.object({
  name: z.string(),
  homepage: z.string(),
  items: z.array(registryItemSchema).min(1),
})

export type Registry = z.infer<typeof registrySchema>

/** The resolved registry with all file contents populated */
export const resolvedRegistrySchema = registrySchema.extend({
  items: z.array(
    registryItemSchema.extend({
      files: z.array(registryFileSchema.extend({ content: z.string() })).optional(),
    })
  ),
})

export type ResolvedRegistry = z.infer<typeof resolvedRegistrySchema>
