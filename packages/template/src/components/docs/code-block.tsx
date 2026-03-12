import { codeToHtml } from 'shiki'

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    css: 'css',
    json: 'json',
    md: 'markdown',
    html: 'html',
  }
  return langMap[ext || ''] || 'typescript'
}

export async function CodeBlock({
  code,
  filename,
  language,
}: {
  code: string
  filename?: string
  language?: string
}) {
  const lang = language || (filename ? getLanguage(filename) : 'typescript')

  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  })

  return (
    <div className="relative rounded-lg border border-border overflow-hidden">
      <div
        className="[&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
