import { spawn } from 'node:child_process'
import { log } from '../utils/logger.js'
import { prepareSite } from '../generator/site-generator.js'
import { writeBlockFiles } from '../generator/block-writer.js'

export async function landingDev(options: { cwd?: string; port?: number } = {}) {
  const cwd = options.cwd || process.cwd()
  const port = options.port || 3001

  const { siteDir } = await prepareSite({
    cwd,
    templateName: 'landing-template',
    siteDirName: 'landing',
    writeFiles: writeBlockFiles,
  })

  // Start Next.js dev server
  console.log()
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
