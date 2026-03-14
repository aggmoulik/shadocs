import type { Metadata } from 'next'
import Link from 'next/link'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Getting Started',
}

export default async function GettingStartedPage() {
  const initCode = `npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json`
  const initCustomCode = `# Use a custom template
npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json --template https://github.com/user/my-template.git

# Skip prompts and use defaults
npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json -y`
  const docsDevCode = `npx @aggmoulik/shadocs docs dev`
  const docsBuildCode = `npx @aggmoulik/shadocs docs build`
  const landingDevCode = `npx @aggmoulik/shadocs landing dev`
  const landingBuildCode = `npx @aggmoulik/shadocs landing build`
  const syncCode = `npx @aggmoulik/shadocs sync`
  const gitignoreCode = `.shadocs/
out/
out-landing/`

  const projectStructure = `my-project/
  shadocs.json          # Resolved registry data
  shadocs.config.ts     # Configuration
  docs/                 # Your docs site (you own this!)
    src/
    package.json
    next.config.ts
  landing/              # Your landing page (you own this!)
    src/
    package.json
    next.config.ts`

  const configCode = `import { defineConfig } from 'shadocs'

export default defineConfig({
  registry: {
    source: 'https://your-registry.com/r/registry.json',
    name: 'My Components',
    description: 'A collection of reusable components',
    homepage: 'https://your-registry.com',
  },
  sites: ['docs', 'landing'],
  site: {
    title: 'My Components Docs',
  },
})`

  const [
    initHtml, initCustomHtml, docsDevHtml, docsBuildHtml,
    landingDevHtml, landingBuildHtml, syncHtml,
    gitignoreHtml, projectStructureHtml, configHtml,
  ] = await Promise.all([
    highlight(initCode, 'bash'),
    highlight(initCustomCode, 'bash'),
    highlight(docsDevCode, 'bash'),
    highlight(docsBuildCode, 'bash'),
    highlight(landingDevCode, 'bash'),
    highlight(landingBuildCode, 'bash'),
    highlight(syncCode, 'bash'),
    highlight(gitignoreCode, 'bash'),
    highlight(projectStructure, 'bash'),
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
          Point shadocs at your registry URL. It fetches all components, resolves dependencies, downloads source code, and scaffolds your sites.
        </p>
        <CodeBlock html={initHtml} raw={initCode} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          You{"'"}ll be prompted to choose which sites to generate (docs, landing, or both) and optionally provide custom template URLs.
        </p>
        <CodeBlock html={initCustomHtml} raw={initCustomCode} />
      </section>

      {/* Step 2 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          <h2 className="text-xl font-semibold">Project structure</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          After init, your project looks like this. <strong>You own the generated site directories</strong> — feel free to customize them however you want.
        </p>
        <CodeBlock html={projectStructureHtml} raw={projectStructure} />
      </section>

      {/* Step 3 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
          <h2 className="text-xl font-semibold">Start the dev server</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Launch the documentation site or landing page with live reload.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Docs site (port 3000)</p>
            <CodeBlock html={docsDevHtml} raw={docsDevCode} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Landing page (port 3001)</p>
            <CodeBlock html={landingDevHtml} raw={landingDevCode} />
          </div>
        </div>
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
          <h2 className="text-xl font-semibold">Sync registry updates</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When your registry changes, sync updates your component data without touching the template files you{"'"}ve customized.
        </p>
        <CodeBlock html={syncHtml} raw={syncCode} />
      </section>

      {/* Step 6 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">6</span>
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

      {/* Tip */}
      <section className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <h3 className="text-sm font-semibold">Tip: Install globally for shorter commands</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Run <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">npm install -g @aggmoulik/shadocs</code> to use <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs</code> directly instead of <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">npx @aggmoulik/shadocs</code>.
        </p>
      </section>

      {/* Gitignore */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Add to .gitignore</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The build output and cache directories should be ignored by git. The <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">docs/</code> and <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">landing/</code> directories are yours to commit and customize.
        </p>
        <CodeBlock html={gitignoreHtml} raw={gitignoreCode} filename=".gitignore" />
      </section>
    </article>
  )
}
