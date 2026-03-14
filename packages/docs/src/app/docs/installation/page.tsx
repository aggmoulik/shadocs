import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Installation',
}

export default async function InstallationPage() {
  const npxCode = `npx shadocs init https://your-registry.com/r/registry.json`
  const globalInstallCode = `# Install globally
npm install -g shadocs

# Then use directly
shadocs init https://your-registry.com/r/registry.json`

  const [npxHtml, globalHtml] = await Promise.all([
    highlight(npxCode, 'bash'),
    highlight(globalInstallCode, 'bash'),
  ])

  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Install shadocs and set up your first documentation site.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Using npx (recommended)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The easiest way to use shadocs is with npx. No installation needed — it runs the latest version directly.
        </p>
        <CodeBlock html={npxHtml} raw={npxCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Global install</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you prefer having shadocs available as a global command:
        </p>
        <CodeBlock html={globalHtml} raw={globalInstallCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Requirements</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
          <li><strong className="text-foreground">Node.js 18+</strong> — required for the CLI and Next.js build</li>
          <li><strong className="text-foreground">pnpm</strong> — used for dependency installation in the generated site</li>
          <li><strong className="text-foreground">A shadcn/ui-compatible registry</strong> — your registry.json URL or local path</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What gets created</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you run <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs init</code>, two files are created in your project root:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
          <li><code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.json</code> — resolved registry data with all component source code</li>
          <li><code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code> — site configuration (name, theme, navigation)</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you run dev or build, a <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">.shadocs/</code> directory is created with the generated Next.js site. This directory should be added to your <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">.gitignore</code>.
        </p>
      </section>
    </article>
  )
}
