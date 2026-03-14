import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { log } from '../utils/logger.js'

export async function dev(options: { cwd?: string; port?: number } = {}) {
  const cwd = options.cwd || process.cwd()
  const port = options.port || 3000
  const siteDir = resolve(cwd, 'docs')

  if (!existsSync(siteDir)) {
    log.error('No docs/ directory found. Run `npx @aggmoulik/shadocs init <source>` first.')
    process.exit(1)
  }

  log.info(`Starting docs dev server on http://localhost:${port}`)
  console.log()

  const child = spawn('pnpm', ['dev', '--port', String(port)], {
    cwd: siteDir,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })

  process.on('SIGINT', () => child.kill('SIGINT'))
  process.on('SIGTERM', () => child.kill('SIGTERM'))
}
