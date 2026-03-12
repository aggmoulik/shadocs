import { notFound } from 'next/navigation'
import { codeToHtml } from 'shiki'
import { registry, getComponents, getItem, getExamplesForItem, formatType } from '@/lib/registry'
import { ComponentDetail } from './component-detail'

export function generateStaticParams() {
  return registry.items.map((item) => ({
    name: item.name,
  }))
}

export function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  return params.then(({ name }) => {
    const item = getItem(name)
    return {
      title: item ? `${item.title || item.name} — ${registry.name}` : 'Not Found',
      description: item?.description,
    }
  })
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const item = getItem(name)

  if (!item) {
    notFound()
  }

  // Pre-highlight source files
  const highlightedFiles = await Promise.all(
    (item.files || [])
      .filter((f) => f.content)
      .map(async (file) => {
        const lang = file.path.endsWith('.css') ? 'css' : 'tsx'
        const html = await codeToHtml(file.content!, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        })
        return { path: file.path, type: file.type, html, raw: file.content! }
      })
  )

  // Pre-highlight examples
  const examples = getExamplesForItem(item.name)
  const highlightedExamples = await Promise.all(
    examples
      .filter((ex) => ex.files?.[0]?.content)
      .map(async (ex) => {
        const raw = ex.files![0].content!
        const html = await codeToHtml(raw, {
          lang: 'tsx',
          themes: { light: 'github-light', dark: 'github-dark' },
        })
        return { name: ex.name, title: ex.title, html, raw }
      })
  )

  // Build sidebar: all components for navigation
  const allComponents = getComponents()
  const sidebarItems = allComponents.map((c) => ({
    name: c.name,
    title: c.title || c.name,
  }))

  const installCommand = `npx shadcn@latest add ${registry.homepage}/r/${item.name}.json`

  return (
    <ComponentDetail
      item={{
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        author: item.author,
        docs: item.docs,
        categories: item.categories,
        dependencies: item.dependencies,
        devDependencies: item.devDependencies,
        registryDependencies: item.registryDependencies,
        fileCount: item.files?.length || 0,
        cssVars: item.cssVars,
      }}
      registryName={registry.name}
      installCommand={installCommand}
      highlightedFiles={highlightedFiles}
      highlightedExamples={highlightedExamples}
      sidebarItems={sidebarItems}
      currentName={item.name}
    />
  )
}
