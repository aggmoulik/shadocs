import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { log } from '../utils/logger.js'

export async function landingDev(options: { cwd?: string; port?: number } = {}) {
  const cwd = options.cwd || process.cwd()
  const port = options.port || 3001
  const siteDir = resolve(cwd, 'landing')

  if (!existsSync(siteDir)) {
    log.error('No landing/ directory found. Run `npx @aggmoulik/shadocs init <source>` first and select "Landing page".')
    process.exit(1)
  }

  log.info(`Starting landing page dev server on http://localhost:${port}`)
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
