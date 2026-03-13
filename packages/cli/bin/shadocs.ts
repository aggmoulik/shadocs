import { Command } from 'commander'
import { init } from '../src/commands/init.js'
import { build } from '../src/commands/build.js'
import { dev } from '../src/commands/dev.js'
import { landingBuild } from '../src/commands/landing-build.js'
import { landingDev } from '../src/commands/landing-dev.js'

const program = new Command()

program
  .name('shadocs')
  .description('Generate documentation sites and landing pages from shadcn component registries')
  .version('0.1.0')

// Init command (shared)
program
  .command('init')
  .description('Initialize from a shadcn-compatible registry')
  .argument('<source>', 'URL to registry.json or local path')
  .action(async (source: string) => {
    await init(source)
  })

// --- Docs commands ---
const docs = program
  .command('docs')
  .description('Generate component documentation site')

docs
  .command('dev')
  .description('Start docs development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options: { port: string }) => {
    await dev({ port: parseInt(options.port, 10) })
  })

docs
  .command('build')
  .description('Build static docs site')
  .action(async () => {
    await build()
  })

// --- Landing commands ---
const landing = program
  .command('landing')
  .description('Generate blocks showcase landing page')

landing
  .command('dev')
  .description('Start landing page development server')
  .option('-p, --port <port>', 'Port number', '3001')
  .action(async (options: { port: string }) => {
    await landingDev({ port: parseInt(options.port, 10) })
  })

landing
  .command('build')
  .description('Build static landing page')
  .action(async () => {
    await landingBuild()
  })

// --- Backwards-compatible aliases ---
program
  .command('dev')
  .description('Start docs dev server (shorthand for "docs dev")')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options: { port: string }) => {
    await dev({ port: parseInt(options.port, 10) })
  })

program
  .command('build')
  .description('Build docs site (shorthand for "docs build")')
  .action(async () => {
    await build()
  })

program.parse()
