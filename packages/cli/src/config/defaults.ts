import type { ShadocsConfig } from './schema.js'

export function createDefaultConfig(
  source: string,
  registryName: string,
  homepage?: string
): ShadocsConfig {
  return {
    registry: {
      source,
      name: registryName,
      homepage,
    },
    site: {
      title: `${registryName} Docs`,
    },
    nav: {
      links: homepage ? [{ title: 'Homepage', href: homepage }] : [],
    },
    output: {
      dir: './out',
    },
  }
}
