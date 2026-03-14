import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'CLI Reference',
}

export default async function CLIReferencePage() {
  const initCode = `shadocs init <source>

# Examples
shadocs init https://ui.shadcn.com/r/registry.json
shadocs init ./path/to/local/registry.json
shadocs init https://your-site.com/r/registry.json`

  const docsDevCode = `shadocs docs dev [options]

# Options
#   -p, --port <port>  Port number (default: 3000)

# Examples
shadocs docs dev
shadocs docs dev --port 4000`

  const docsBuildCode = `shadocs docs build

# Outputs static site to ./out`

  const landingDevCode = `shadocs landing dev [options]

# Options
#   -p, --port <port>  Port number (default: 3001)

# Examples
shadocs landing dev
shadocs landing dev --port 4001`

  const landingBuildCode = `shadocs landing build

# Outputs static site to ./out-landing`

  const aliasCode = `# These are equivalent:
shadocs dev        # → shadocs docs dev
shadocs build      # → shadocs docs build`

  const [initHtml, docsDevHtml, docsBuildHtml, landingDevHtml, landingBuildHtml, aliasHtml] =
    await Promise.all([
      highlight(initCode, 'bash'),
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

      {/* init */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs init</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Initialize a shadocs project from a registry. Fetches the registry, resolves all items and their dependencies, downloads shadcn/ui base components, and saves everything to <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.json</code>.
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
            <li>Generates <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code></li>
          </ol>
        </div>
      </section>

      {/* docs dev */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs docs dev</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start the documentation site development server. Generates a Next.js site from your registry data, injects component files, installs dependencies, and launches the dev server with hot reload.
        </p>
        <CodeBlock html={docsDevHtml} raw={docsDevCode} />
      </section>

      {/* docs build */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs docs build</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build the documentation site for production. Generates a static export in the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">./out</code> directory, ready to deploy to any static hosting provider.
        </p>
        <CodeBlock html={docsBuildHtml} raw={docsBuildCode} />
      </section>

      {/* landing dev */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono">shadocs landing dev</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start the landing page development server. This generates a blocks showcase site with live previews, a theme editor, and install commands. Only items with <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">type: &quot;registry:block&quot;</code> are included.
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
          For backward compatibility, <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs dev</code> and <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs build</code> are aliases for the docs commands.
        </p>
        <CodeBlock html={aliasHtml} raw={aliasCode} />
      </section>
    </article>
  )
}
