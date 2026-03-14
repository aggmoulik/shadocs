import type { Metadata } from 'next'
import { highlight } from '@/lib/highlight'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Registry Format',
}

export default async function RegistryFormatPage() {
  const registryCode = `{
  "name": "my-components",
  "homepage": "https://my-site.com",
  "items": [
    {
      "name": "magic-card",
      "type": "registry:component",
      "title": "Magic Card",
      "description": "An interactive card with a spotlight effect",
      "dependencies": ["framer-motion"],
      "registryDependencies": ["card"],
      "files": [
        {
          "path": "registry/components/magic-card.tsx",
          "type": "registry:component"
        }
      ]
    },
    {
      "name": "pricing-table",
      "type": "registry:block",
      "title": "Pricing Table",
      "description": "A responsive pricing comparison table",
      "categories": ["marketing", "pricing"],
      "dependencies": ["framer-motion"],
      "registryDependencies": ["button", "card", "badge"],
      "files": [
        {
          "path": "registry/blocks/pricing-table/pricing-table.tsx",
          "type": "registry:block",
          "target": "components/blocks/pricing-table.tsx"
        },
        {
          "path": "registry/blocks/pricing-table/demo.tsx",
          "type": "registry:block",
          "target": "components/blocks/pricing-table-demo.tsx"
        }
      ]
    },
    {
      "name": "magic-card-demo",
      "type": "registry:example",
      "registryDependencies": ["magic-card"],
      "files": [
        {
          "path": "registry/examples/magic-card-demo.tsx",
          "type": "registry:example"
        }
      ]
    }
  ]
}`

  const itemTypesCode = `// Component types recognized by shadocs:
"registry:ui"         // Base UI primitives (button, card, input)
"registry:component"  // Reusable components
"registry:block"      // Full-page blocks/sections
"registry:example"    // Example/demo components
"registry:hook"       // React hooks
"registry:lib"        // Utility libraries`

  const fileFieldCode = `"files": [
  {
    // Source path in your registry
    "path": "registry/components/magic-card.tsx",

    // Must match the item type
    "type": "registry:component",

    // Optional: where the file should be installed
    // (used for blocks — target path in the user's project)
    "target": "components/blocks/magic-card.tsx",

    // Content is auto-resolved during \`shadocs init\`
    "content": "..."
  }
]`

  const exampleMatchCode = `// shadocs finds examples for components by:
// 1. Items of type "registry:example" that list the component
//    in their registryDependencies
// 2. Items whose name matches "{component-name}-demo"

// Example: for a component named "magic-card"
{
  "name": "magic-card-demo",
  "type": "registry:example",
  "registryDependencies": ["magic-card"],
  "files": [...]
}`

  const [registryHtml, itemTypesHtml, fileFieldHtml, exampleMatchHtml] =
    await Promise.all([
      highlight(registryCode, 'json'),
      highlight(itemTypesCode, 'typescript'),
      highlight(fileFieldCode, 'json'),
      highlight(exampleMatchCode, 'typescript'),
    ])

  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registry Format</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          shadocs works with any shadcn/ui-compatible registry. Here&apos;s how to structure your registry for the best documentation experience.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Registry structure</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A registry is a JSON file with a name, homepage URL, and an array of items. Each item represents a component, block, example, or utility.
        </p>
        <CodeBlock html={registryHtml} raw={registryCode} filename="registry.json" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Item types</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">type</code> field determines how shadocs categorizes and displays the item.
        </p>
        <CodeBlock html={itemTypesHtml} raw={itemTypesCode} />
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-sm font-semibold">Docs vs Landing</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
            <li>The <strong className="text-foreground">docs site</strong> shows all types except examples (which appear as demos within component pages)</li>
            <li>The <strong className="text-foreground">landing page</strong> only shows items with <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">registry:block</code> type</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Item fields</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Field</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Required</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">name</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">Yes</td>
                <td className="py-2">Unique identifier for the item</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">type</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">Yes</td>
                <td className="py-2">Item type (see above)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">title</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Display title (auto-generated from name if omitted)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">description</td>
                <td className="py-2 pr-4 font-mono text-xs">string</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Short description of the component</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">dependencies</td>
                <td className="py-2 pr-4 font-mono text-xs">string[]</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">npm packages required by this component</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">registryDependencies</td>
                <td className="py-2 pr-4 font-mono text-xs">string[]</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Other registry items this depends on</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">categories</td>
                <td className="py-2 pr-4 font-mono text-xs">string[]</td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Category tags for organization</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs text-foreground">files</td>
                <td className="py-2 pr-4 font-mono text-xs">File[]</td>
                <td className="py-2 pr-4">Yes</td>
                <td className="py-2">Array of source files</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">File objects</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each file in the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">files</code> array specifies a source file and where it should be installed.
        </p>
        <CodeBlock html={fileFieldHtml} raw={fileFieldCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Example matching</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The docs site automatically finds example/demo components for each main component. shadocs looks for items that reference the component in their <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">registryDependencies</code> or whose name follows the <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">{'{component-name}-demo'}</code> convention.
        </p>
        <CodeBlock html={exampleMatchHtml} raw={exampleMatchCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Dependency resolution</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          shadocs automatically handles dependency resolution during <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">init</code>:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
          <li><strong className="text-foreground">npm dependencies</strong> — declared in <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">dependencies</code> are installed automatically</li>
          <li><strong className="text-foreground">Registry dependencies</strong> — references to other registry items (like <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">button</code>, <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">card</code>) are resolved. If they exist in your registry, those are used; otherwise, shadocs fetches the shadcn/ui versions</li>
          <li><strong className="text-foreground">Import scanning</strong> — shadocs also scans source code for <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">import</code> statements to catch undeclared npm dependencies</li>
        </ul>
      </section>
    </article>
  )
}
