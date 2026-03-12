import { Command } from 'commander'
import { init } from '../src/commands/init.js'
import { build } from '../src/commands/build.js'
import { dev } from '../src/commands/dev.js'

const program = new Command()

program
  .name('shadocs')
  .description('Generate beautiful documentation sites from shadcn component registries')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize docs from a shadcn-compatible registry')
  .argument('<source>', 'URL to registry.json (e.g. https://magicui.design/r/registry.json) or local path (e.g. ./registry.json)')
  .action(async (source: string) => {
    await init(source)
  })

program
  .command('build')
  .description('Build static documentation site')
  .action(async () => {
    await build()
  })

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options: { port: string }) => {
    await dev({ port: parseInt(options.port, 10) })
  })

program.parse()
