import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Installation',
}

export default async function InstallationPage() {
  const npxCode = `npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json`
  const globalInstallCode = `# Install globally
npm install -g @aggmoulik/shadocs

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
          If you prefer having shadocs available as a global command, install it globally. Then you can use <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs</code> directly without <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">npx</code>.
        </p>
        <CodeBlock html={globalHtml} raw={globalInstallCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Requirements</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
          <li><strong className="text-foreground">Node.js 18+</strong> — required for the CLI and Next.js build</li>
          <li><strong className="text-foreground">pnpm</strong> — used for dependency installation in the generated site</li>
          <li><strong className="text-foreground">A shadcn/ui-compatible registry</strong> — your registry.json URL or local path</li>
          <li><strong className="text-foreground">git</strong> — required if using custom templates from git URLs</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What gets created</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you run <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs init</code>, the following are created in your project:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
          <li><code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.json</code> — resolved registry data with all component source code</li>
          <li><code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code> — site configuration (name, theme, navigation)</li>
          <li><code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">docs/</code> — your documentation site (a full Next.js app you own)</li>
          <li><code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">landing/</code> — your landing page (if selected during init)</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">docs/</code> and <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">landing/</code> directories are <strong>yours to own and customize</strong>. Unlike tools that hide generated code, shadocs scaffolds it directly into your project so you have full control.
        </p>
      </section>
    </article>
  )
}
