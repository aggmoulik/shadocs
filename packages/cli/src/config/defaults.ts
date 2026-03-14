import type { ShadocsConfig, SiteType } from './schema.js'

export interface CreateConfigOptions {
  source: string
  registryName: string
  homepage?: string
  sites: SiteType[]
  templates?: { docs?: string; landing?: string }
}

export function createDefaultConfig(options: CreateConfigOptions): ShadocsConfig {
  const { source, registryName, homepage, sites, templates } = options

  return {
    registry: {
      source,
      name: registryName,
      homepage,
    },
    sites,
    ...(templates && { templates }),
    site: {
      title: `${registryName} Docs`,
    },
    nav: {
      links: homepage ? [{ title: 'Homepage', href: homepage }] : [],
    },
    output: {
      docs: './out',
      landing: './out-landing',
    },
  }
}
