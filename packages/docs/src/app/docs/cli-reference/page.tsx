import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'CLI Reference',
}

export default async function CLIReferencePage() {
  const installNote = `# Using npx (no install needed)
npx @aggmoulik/shadocs <command>

# Or install globally, then use "shadocs" directly
npm install -g @aggmoulik/shadocs
shadocs <command>`

  const initCode = `npx @aggmoulik/shadocs init <source>

# Options
#   -t, --template <url>  Custom template (git URL or local path)
#   -y, --yes             Skip prompts and use defaults

# Examples
npx @aggmoulik/shadocs init https://ui.shadcn.com/r/registry.json
npx @aggmoulik/shadocs init ./path/to/local/registry.json
npx @aggmoulik/shadocs init https://your-site.com/r/registry.json -y
npx @aggmoulik/shadocs init https://your-site.com/r/registry.json --template https://github.com/user/my-template.git`

  const syncCode = `npx @aggmoulik/shadocs sync

# Re-fetches registry data and updates component files
# in existing docs/ and landing/ directories
# without touching template files you've customized`

  const docsDevCode = `npx @aggmoulik/shadocs docs dev [options]

# Options
#   -p, --port <port>  Port number (default: 3000)

# Examples
npx @aggmoulik/shadocs docs dev
npx @aggmoulik/shadocs docs dev --port 4000`

  const docsBuildCode = `npx @aggmoulik/shadocs docs build

# Outputs static site to ./out`

  const landingDevCode = `npx @aggmoulik/shadocs landing dev [options]

# Options
#   -p, --port <port>  Port number (default: 3001)

# Examples
npx @aggmoulik/shadocs landing dev
npx @aggmoulik/shadocs landing dev --port 4001`

  const landingBuildCode = `npx @aggmoulik/shadocs landing build

# Outputs static site to ./out-landing`

  const aliasCode = `# These are equivalent:
npx @aggmoulik/shadocs dev        # → docs dev
npx @aggmoulik/shadocs build      # → docs build`

  const [installNoteHtml, initHtml, syncHtml, docsDevHtml, docsBuildHtml, landingDevHtml, landingBuildHtml, aliasHtml] =
    await Promise.all([
      highlight(installNote, 'bash'),
      highlight(initCode, 'bash'),
      highlight(syncCode, 'bash'),
      highlight(docsDevCode, 'bash'),
      highlight(docsBuildCode, 'bash'),
      highlight(landingDevCode, 'bash'),
      highlight(landingBuildCode, 'bash'),
      highlight(aliasCode, 'bash'),
    ])

  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CLI Reference</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          All available commands and their options.
        </p>
      </div>

      {/* Usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Usage</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Run commands with <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">npx @aggmoulik/shadocs</code>, or install globally to use <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs</code> directly.
        </p>
        <CodeBlock html={installNoteHtml} raw={installNote} />
      </section>

      {/* init */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs init</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Initialize a shadocs project from a registry. Fetches the registry, resolves all items, downloads shadcn/ui base components, and scaffolds site directories into your project. You{"'"}ll be prompted to choose which sites to generate.
        </p>
        <CodeBlock html={initHtml} raw={initCode} />
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-semibold">What happens during init:</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside leading-relaxed">
            <li>Fetches and validates the registry (supports URL or local file path)</li>
            <li>Resolves all items in parallel — fetches individual component files</li>
            <li>Collects npm dependencies declared by each component</li>
            <li>Fetches required shadcn/ui base components (button, card, etc.)</li>
            <li>Saves resolved data to <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.json</code></li>
            <li>Prompts for site selection (docs / landing / both)</li>
            <li>Scaffolds selected sites into <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">docs/</code> and/or <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">landing/</code></li>
            <li>Generates <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code></li>
          </ol>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Custom templates</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">--template</code> to provide a custom template (git URL or local path). During interactive mode, you can also set custom templates per site type.
          </p>
        </div>
      </section>

      {/* sync */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs sync</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Re-fetch registry data and update component files in your existing site directories. Template files you{"'"}ve customized are left untouched — only registry data and generated component files are updated.
        </p>
        <CodeBlock html={syncHtml} raw={syncCode} />
      </section>

      {/* docs dev */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs docs dev</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start the documentation site development server. Runs <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">next dev</code> in the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">docs/</code> directory.
        </p>
        <CodeBlock html={docsDevHtml} raw={docsDevCode} />
      </section>

      {/* docs build */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs docs build</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build the documentation site for production. Generates a static export in the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">./out</code> directory.
        </p>
        <CodeBlock html={docsBuildHtml} raw={docsBuildCode} />
      </section>

      {/* landing dev */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs landing dev</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start the landing page development server. Runs <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">next dev</code> in the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">landing/</code> directory.
        </p>
        <CodeBlock html={landingDevHtml} raw={landingDevCode} />
      </section>

      {/* landing build */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs landing build</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build the landing page for production. Output goes to <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">./out-landing</code>.
        </p>
        <CodeBlock html={landingBuildHtml} raw={landingBuildCode} />
      </section>

      {/* Aliases */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Aliases</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For convenience, <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs dev</code> and <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs build</code> are aliases for the docs commands.
        </p>
        <CodeBlock html={aliasHtml} raw={aliasCode} />
      </section>
    </article>
  )
}
