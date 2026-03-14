import type { Metadata } from 'next'
import Link from 'next/link'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Getting Started',
}

export default async function GettingStartedPage() {
  const initCode = `npx shadocs init https://your-registry.com/r/registry.json`
  const docsDevCode = `npx shadocs docs dev`
  const docsBuildCode = `npx shadocs docs build`
  const landingDevCode = `npx shadocs landing dev`
  const landingBuildCode = `npx shadocs landing build`
  const gitignoreCode = `.shadocs/
out/
out-landing/`

  const configCode = `import type { ShadocsConfig } from 'shadocs'

const config: ShadocsConfig = {
  registry: {
    source: 'https://your-registry.com/r/registry.json',
    name: 'My Components',
    description: 'A collection of reusable components',
    homepage: 'https://your-registry.com',
  },
  site: {
    title: 'My Components Docs',
  },
}

export default config`

  const [
    initHtml, docsDevHtml, docsBuildHtml,
    landingDevHtml, landingBuildHtml, gitignoreHtml, configHtml,
  ] = await Promise.all([
    highlight(initCode, 'bash'),
    highlight(docsDevCode, 'bash'),
    highlight(docsBuildCode, 'bash'),
    highlight(landingDevCode, 'bash'),
    highlight(landingBuildCode, 'bash'),
    highlight(gitignoreCode, 'bash'),
    highlight(configCode, 'typescript'),
  ])

  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Go from a shadcn registry to a full documentation site in under a minute.
        </p>
      </div>

      {/* Step 1 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          <h2 className="text-xl font-semibold">Initialize your project</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Point shadocs at your registry URL. It fetches all components, resolves dependencies, and downloads the source code.
        </p>
        <CodeBlock html={initHtml} raw={initCode} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          This creates <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.json</code> (resolved registry data) and <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code> (configuration).
        </p>
      </section>

      {/* Step 2 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          <h2 className="text-xl font-semibold">Start the docs site</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Launch the documentation site with live reload. Browse your components with syntax-highlighted source code and live examples.
        </p>
        <CodeBlock html={docsDevHtml} raw={docsDevCode} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The docs site runs at <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">http://localhost:3000</code> by default.
        </p>
      </section>

      {/* Step 3 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
          <h2 className="text-xl font-semibold">Start the landing page (optional)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If your registry has blocks (<code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">registry:block</code> type), you can generate a landing page with live previews and a theme editor.
        </p>
        <CodeBlock html={landingDevHtml} raw={landingDevCode} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The landing page runs at <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">http://localhost:3001</code> by default.
        </p>
      </section>

      {/* Step 4 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
          <h2 className="text-xl font-semibold">Build for production</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Generate a static site ready to deploy anywhere.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Docs site</p>
            <CodeBlock html={docsBuildHtml} raw={docsBuildCode} />
            <p className="text-xs text-muted-foreground mt-1">Output: <code className="px-1 py-0.5 rounded bg-muted font-mono">./out</code></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Landing page</p>
            <CodeBlock html={landingBuildHtml} raw={landingBuildCode} />
            <p className="text-xs text-muted-foreground mt-1">Output: <code className="px-1 py-0.5 rounded bg-muted font-mono">./out-landing</code></p>
          </div>
        </div>
      </section>

      {/* Step 5 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
          <h2 className="text-xl font-semibold">Customize (optional)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Edit <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code> to customize your site.
        </p>
        <CodeBlock html={configHtml} raw={configCode} filename="shadocs.config.ts" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          See the <Link href="/docs/configuration" className="text-foreground underline underline-offset-4 hover:opacity-80">Configuration</Link> page for all options.
        </p>
      </section>

      {/* Gitignore */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Add to .gitignore</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The generated site directories should be ignored by git:
        </p>
        <CodeBlock html={gitignoreHtml} raw={gitignoreCode} filename=".gitignore" />
      </section>
    </article>
  )
}
