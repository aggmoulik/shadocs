import { Command } from 'commander'
import { init } from '../src/commands/init.js'
import { build } from '../src/commands/build.js'
import { dev } from '../src/commands/dev.js'
import { landingBuild } from '../src/commands/landing-build.js'
import { landingDev } from '../src/commands/landing-dev.js'
import { sync } from '../src/commands/sync.js'

const program = new Command()

program
  .name('shadocs')
  .description('Generate documentation sites and landing pages from shadcn component registries')
  .version('0.1.0')

// Init command
program
  .command('init')
  .description('Initialize from a shadcn-compatible registry')
  .argument('<source>', 'URL to registry.json or local path')
  .option('-t, --template <url>', 'Custom template (git URL or local path)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (source: string, options: { template?: string; yes?: boolean }) => {
    await init(source, { template: options.template, yes: options.yes })
  })

// Sync command
program
  .command('sync')
  .description('Re-fetch registry and update site data without re-scaffolding templates')
  .action(async () => {
    await sync()
  })

// --- Docs commands ---
const docs = program
  .command('docs')
  .description('Component documentation site')

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
  .description('Blocks showcase landing page')

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
