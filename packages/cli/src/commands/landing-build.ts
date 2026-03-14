import { existsSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import ora from 'ora'
import { log } from '../utils/logger.js'

export async function landingBuild(options: { cwd?: string } = {}) {
  const cwd = options.cwd || process.cwd()
  const siteDir = resolve(cwd, 'landing')

  if (!existsSync(siteDir)) {
    log.error('No landing/ directory found. Run `npx @aggmoulik/shadocs init <source>` first and select "Landing page".')
    process.exit(1)
  }

  const buildSpinner = ora('Building landing page (this may take a moment)...').start()
  try {
    execSync('pnpm build', { cwd: siteDir, stdio: 'pipe' })
    buildSpinner.succeed('Landing page built successfully')
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
  const outputDir = resolve(cwd, 'out-landing')
  const nextOutDir = resolve(siteDir, 'out')
  if (existsSync(nextOutDir)) {
    await cp(nextOutDir, outputDir, { recursive: true })
    log.success(`Landing page generated at ./out-landing`)
  }

  console.log()
  log.info('Deploy the ./out-landing directory to any static host:')
  log.dim('  Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.')
}
