import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Configuration',
}

export default async function ConfigurationPage() {
  const fullConfigCode = `import type { ShadocsConfig } from 'shadocs'

const config: ShadocsConfig = {
  // Required: registry source and metadata
  registry: {
    source: 'https://your-site.com/r/registry.json',
    name: 'My Components',
    description: 'A collection of beautiful components',
    homepage: 'https://your-site.com',
  },

  // Optional: site metadata
  site: {
    title: 'My Components Docs',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    ogImage: '/og.png',
  },

  // Optional: theme customization
  theme: {
    primaryColor: '#0ea5e9',
  },

  // Optional: navigation links
  nav: {
    links: [
      { title: 'GitHub', href: 'https://github.com/you/repo' },
      { title: 'Discord', href: 'https://discord.gg/...' },
    ],
  },

  // Optional: output directory
  output: {
    dir: './out',
  },
}`

  const registryCode = `registry: {
  // URL or local file path to your registry.json
  source: 'https://your-site.com/r/registry.json',

  // Display name for the registry
  name: 'My Components',

  // Optional description shown on the homepage
  description: 'A collection of beautiful components',

  // Optional homepage URL — used for install commands
  homepage: 'https://your-site.com',
}`

  const siteCode = `site: {
  // Browser tab title
  title: 'My Components Docs',

  // Logo image path (relative to public/)
  logo: '/logo.svg',

  // Favicon path
  favicon: '/favicon.ico',

  // Open Graph image for social sharing
  ogImage: '/og.png',
}`

  const [fullHtml, registryHtml, siteHtml] = await Promise.all([
    highlight(fullConfigCode, 'typescript'),
    highlight(registryCode, 'typescript'),
    highlight(siteCode, 'typescript'),
  ])

  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Customize your documentation site with <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">shadocs.config.ts</code>.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Full example</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Here&apos;s a complete configuration file with all available options:
        </p>
        <CodeBlock html={fullHtml} raw={fullConfigCode} filename="shadocs.config.ts" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono text-lg">registry</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The registry section is required. It tells shadocs where to find your component registry and provides display metadata.
        </p>
        <CodeBlock html={registryHtml} raw={registryCode} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Option</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Required</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">source</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">Yes</td>
                <td className="py-2">URL or local path to registry.json</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">name</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">Yes</td>
                <td className="py-2">Display name for the registry</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">description</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Shown on the homepage</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">homepage</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Used in install commands</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono text-lg">site</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Optional site metadata for branding and SEO.
        </p>
        <CodeBlock html={siteHtml} raw={siteCode} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Option</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">title</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2">Browser tab title</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">logo</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2">Logo image path</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">favicon</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2">Favicon path</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">ogImage</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2">Open Graph image for social sharing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono text-lg">theme</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Customize the visual appearance of your documentation site.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Option</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">primaryColor</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2">Primary brand color (hex)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono text-lg">nav</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Add external links to the site header navigation.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Option</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">links</td>
                <td className="py-2 pr-4 font-mono text-xs">{`{ title, href }[]`}</td>
                <td className="py-2">Array of navigation links</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          <code className="font-mono text-lg">output</code>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Configure where the built site is output.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Option</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Default</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">dir</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4 font-mono text-xs">./out</td>
                <td className="py-2">Output directory for static build</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  )
}
