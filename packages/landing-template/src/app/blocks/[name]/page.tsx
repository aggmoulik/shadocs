import { notFound } from 'next/navigation'
import { codeToHtml } from 'shiki'
import { registry, getBlocks, getBlock, formatBlockName } from '@/lib/registry'
import { BlockDetail } from './block-detail'

export function generateStaticParams() {
  return getBlocks().map((block) => ({
    name: block.name,
  }))
}

export function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  return params.then(({ name }) => {
    const block = getBlock(name)
    return {
      title: block ? `${block.title || formatBlockName(block.name)} — ${registry.name}` : 'Not Found',
      description: block?.description,
    }
  })
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const block = getBlock(name)

  if (!block) {
    notFound()
  }

  // Pre-highlight all source files
  const highlightedFiles = await Promise.all(
    (block.files || [])
      .filter((f) => f.content)
      .map(async (file) => {
        const lang = file.path.endsWith('.css') ? 'css' : file.path.endsWith('.json') ? 'json' : 'tsx'
        const html = await codeToHtml(file.content!, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        })
        return {
          path: file.path,
          type: file.type,
          html,
          raw: file.content!,
          isDemo: file.path.includes('-demo.'),
        }
      })
  )

  // Build navigation
  const allBlocks = getBlocks()
  const currentIndex = allBlocks.findIndex((b) => b.name === name)
  const prev = currentIndex > 0 ? allBlocks[currentIndex - 1] : null
  const next = currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null

  const installCommand = `npx shadcn@latest add ${registry.homepage}/r/${block.name}.json`

  return (
    <BlockDetail
      block={{
        name: block.name,
        title: block.title || formatBlockName(block.name),
        description: block.description,
        dependencies: block.dependencies,
        registryDependencies: block.registryDependencies,
        categories: block.categories,
        fileCount: block.files?.length || 0,
      }}
      registryName={registry.name}
      installCommand={installCommand}
      highlightedFiles={highlightedFiles}
      prev={prev ? { name: prev.name, title: prev.title || formatBlockName(prev.name) } : null}
      next={next ? { name: next.name, title: next.title || formatBlockName(next.name) } : null}
    />
  )
}
