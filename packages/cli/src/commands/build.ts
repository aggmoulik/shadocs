import { existsSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import ora from 'ora'
import { log } from '../utils/logger.js'

export async function build(options: { cwd?: string } = {}) {
  const cwd = options.cwd || process.cwd()
  const siteDir = resolve(cwd, 'docs')

  if (!existsSync(siteDir)) {
    log.error('No docs/ directory found. Run `npx @aggmoulik/shadocs init <source>` first.')
    process.exit(1)
  }

  const buildSpinner = ora('Building docs site (this may take a moment)...').start()
  try {
    execSync('pnpm build', { cwd: siteDir, stdio: 'pipe' })
    buildSpinner.succeed('Docs site built successfully')
  } catch (e) {
    buildSpinner.fail('Build failed')
    if (e instanceof Error && 'stdout' in e) {
      console.error((e as { stdout: Buffer }).stdout?.toString())
    }
    if (e instanceof Error && 'stderr' in e) {
      console.error((e as { stderr: Buffer }).stderr?.toString())
    }
    process.exit(1)
  }

  // Copy output
  const outputDir = resolve(cwd, 'out')
  const nextOutDir = resolve(siteDir, 'out')
  if (existsSync(nextOutDir)) {
    await cp(nextOutDir, outputDir, { recursive: true })
    log.success(`Static site generated at ./out`)
  }

  console.log()
  log.info('Deploy the ./out directory to any static host:')
  log.dim('  Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.')
}
