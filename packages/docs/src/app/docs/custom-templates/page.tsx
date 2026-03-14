import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Custom Templates',
}

export default async function CustomTemplatesPage() {
  const initTemplateCode = `# Use a custom docs template from a git repo
npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json \\
  --template https://github.com/user/my-docs-template.git

# Or use a local path
npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json \\
  --template /path/to/local/template`

  const interactiveCode = `# Interactive mode (default) lets you set templates per site type
npx @aggmoulik/shadocs init https://your-registry.com/r/registry.json

# You'll be prompted:
# ? Which sites would you like to generate?
#   ◉ Documentation site
#   ◉ Landing page
# ? Use a custom docs template? No
# ? Use a custom landing template? Yes
# ? Enter landing template URL: https://github.com/user/my-landing.git`

  const configCode = `import { defineConfig } from 'shadocs'

export default defineConfig({
  registry: {
    source: 'https://your-registry.com/r/registry.json',
    name: 'My Components',
  },
  sites: ['docs', 'landing'],
  templates: {
    docs: 'https://github.com/user/my-docs-template.git',
    landing: 'https://github.com/user/my-landing-template.git',
  },
})`

  const templateStructure = `my-template/
├── package.json          # Must exist (Next.js project)
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Your custom layout
│   │   ├── page.tsx      # Your custom homepage
│   │   └── globals.css   # Your styles
│   ├── components/       # Your components
│   └── lib/
│       └── registry-data.json  # Injected by shadocs
└── public/               # Static assets`

  const syncCode = `# After customizing your template, sync registry data
npx @aggmoulik/shadocs sync

# This updates:
#   - src/lib/registry-data.json (registry data)
#   - Component/block source files
#   - New npm dependencies
#
# It does NOT touch:
#   - Your layout, pages, or styles
#   - Your custom components
#   - Your configuration files`

  const [
    initTemplateHtml, interactiveHtml, configHtml,
    templateStructureHtml, syncHtml,
  ] = await Promise.all([
    highlight(initTemplateCode, 'bash'),
    highlight(interactiveCode, 'bash'),
    highlight(configCode, 'typescript'),
    highlight(templateStructure, 'bash'),
    highlight(syncCode, 'bash'),
  ])

  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custom Templates</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Use your own templates or community templates to customize how your docs and landing pages look.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you run <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs init</code>, it scaffolds a template into your project directory. By default, it uses the built-in shadocs templates. You can provide your own template via a git URL or local path.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The scaffolded code is <strong>yours to own</strong>. Unlike tools that hide generated code in hidden directories, shadocs puts the full Next.js app right in your project so you can customize everything.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Using the --template flag</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pass a git URL or local path to use a custom template for the docs site.
        </p>
        <CodeBlock html={initTemplateHtml} raw={initTemplateCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Interactive mode</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Without the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">-y</code> flag, init runs in interactive mode where you can set custom templates for each site type independently.
        </p>
        <CodeBlock html={interactiveHtml} raw={interactiveCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Template requirements</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A custom template must be a valid Next.js project. shadocs will inject registry data into it.
        </p>
        <CodeBlock html={templateStructureHtml} raw={templateStructure} />
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-semibold">Requirements:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
            <li>Must have a <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">package.json</code> at the root</li>
            <li>Must be a Next.js project (shadocs runs <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">next dev</code> and <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">next build</code>)</li>
            <li>Registry data is written to <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">src/lib/registry-data.json</code></li>
            <li>Component files are written to <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">src/</code> using their original paths</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Config file</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Template URLs are saved in <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code> so they{"'"}re remembered for future operations.
        </p>
        <CodeBlock html={configHtml} raw={configCode} filename="shadocs.config.ts" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Syncing updates</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          After customizing your scaffolded site, use <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs sync</code> to update registry data without overwriting your changes.
        </p>
        <CodeBlock html={syncHtml} raw={syncCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Creating a template</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To create your own template:
        </p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
          <li>Start with a shadocs-generated site (<code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs init</code> with defaults)</li>
          <li>Customize the layout, styles, pages, and components to your liking</li>
          <li>Push to a git repository</li>
          <li>Share the URL — others can use it with <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">--template your-url</code></li>
        </ol>
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Tip</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Keep <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">src/lib/registry-data.json</code> in your template with sample data so the template works standalone during development. shadocs will overwrite it with real data during init.
          </p>
        </div>
      </section>
    </article>
  )
}
