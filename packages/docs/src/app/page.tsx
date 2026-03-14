import Link from 'next/link'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export default async function HomePage() {
  const quickStartCode = `# Initialize from your registry
npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json

# Start the docs site
npx @aggmoulik/shadocs docs dev

# Start the landing page
npx @aggmoulik/shadocs landing dev`

  const quickStartHtml = await highlight(quickStartCode, 'bash')

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground">
                v0.1.0
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Beautiful docs for your{' '}
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                shadcn registry
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Generate documentation sites and landing pages from any shadcn/ui-compatible component registry. One command to init, one to preview, one to build.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
              <Link
                href="/docs/cli-reference"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                CLI Reference
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Quick Start</h2>
          <CodeBlock html={quickStartHtml} raw={quickStartCode} />
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Registry-first"
              description="Works with any shadcn/ui-compatible registry. Point it at your registry.json and get a full docs site."
            />
            <FeatureCard
              title="Two site types"
              description="Generate a component documentation site with code examples, or a blocks landing page with live previews."
            />
            <FeatureCard
              title="Zero config"
              description="Run shadocs init with your registry URL. Everything is auto-configured from your registry metadata."
            />
            <FeatureCard
              title="Static export"
              description="Built on Next.js with static export. Deploy anywhere — Vercel, Netlify, GitHub Pages, or any static host."
            />
            <FeatureCard
              title="Code highlighting"
              description="All component source code is syntax-highlighted with Shiki. Light and dark themes included."
            />
            <FeatureCard
              title="Theme editor"
              description="Landing pages include a built-in theme editor with presets, color pickers, typography controls, and CSS export."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground">
        Built with shadocs
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border p-5 hover:border-foreground/20 transition-colors">
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
