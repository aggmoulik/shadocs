export { init } from './commands/init.js'
export { build } from './commands/build.js'
export { dev } from './commands/dev.js'
export { landingBuild } from './commands/landing-build.js'
export { landingDev } from './commands/landing-dev.js'
export { registrySchema, registryItemSchema } from './registry/validator.js'
export type { Registry, RegistryItem, ResolvedRegistry } from './registry/validator.js'
export type { ShadocsConfig } from './config/schema.js'
export { shadocsConfigSchema } from './config/schema.js'

// Re-export defineConfig for shadocs.config.ts usage
export function defineConfig(config: import('./config/schema.js').ShadocsConfig) {
  return config
}
