import { z } from 'zod'

export const shadocsConfigSchema = z.object({
  /** Registry source URL or local path (set by init) */
  registry: z.object({
    source: z.string(),
    name: z.string(),
    description: z.string().optional(),
    homepage: z.string().optional(),
  }),

  /** Site customization */
  site: z
    .object({
      title: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),

  /** Theme */
  theme: z
    .object({
      primaryColor: z.string().optional(),
    })
    .optional(),

  /** Header navigation links */
  nav: z
    .object({
      links: z
        .array(
          z.object({
            title: z.string(),
            href: z.string(),
          })
        )
        .optional(),
    })
    .optional(),

  /** Hub registration (for registry-hub.io) */
  hub: z
    .object({
      enabled: z.boolean().optional(),
      category: z.string().optional(),
    })
    .optional(),

  /** Output configuration */
  output: z
    .object({
      dir: z.string().optional(),
    })
    .optional(),
})

export type ShadocsConfig = z.infer<typeof shadocsConfigSchema>

export function generateConfigFile(config: ShadocsConfig): string {
  return `import { defineConfig } from 'shadocs'

export default defineConfig(${JSON.stringify(config, null, 2)})
`
}
