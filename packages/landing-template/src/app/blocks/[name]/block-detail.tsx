'use client'

import { useState, useEffect, Component as ReactComponent } from 'react'
import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'

interface HighlightedFile {
  path: string
  type: string
  html: string
  raw: string
  isDemo: boolean
}

interface BlockData {
  name: string
  title: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  categories?: string[]
  fileCount: number
}

interface BlockDetailProps {
  block: BlockData
  registryName: string
  installCommand: string
  highlightedFiles: HighlightedFile[]
  prev: { name: string; title: string } | null
  next: { name: string; title: string } | null
}

export function BlockDetail({
  block,
  registryName,
  installCommand,
  highlightedFiles,
  prev,
  next,
}: BlockDetailProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // Separate demo files from source files for code tab
  const sourceFiles = highlightedFiles.filter((f) => !f.isDemo)
  const demoFiles = highlightedFiles.filter((f) => f.isDemo)
  const codeFiles = [...sourceFiles, ...demoFiles]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {registryName}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{block.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            {prev && (
              <Link href={`/blocks/${prev.name}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                &larr; {prev.title}
              </Link>
            )}
            {prev && next && <span className="text-border">|</span>}
            {next && (
              <Link href={`/blocks/${next.name}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {next.title} &rarr;
              </Link>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Title + Description */}
          <div>
            <h1 className="text-2xl font-bold">{block.title}</h1>
            {block.description && (
              <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
                {block.description}
              </p>
            )}
            {block.categories?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {block.categories.map((cat) => (
                  <span key={cat} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">
                    {cat}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Install command */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 font-mono text-xs">
            <span className="text-muted-foreground select-none">$</span>
            <code className="flex-1 overflow-x-auto">{installCommand}</code>
            <CopyButton
              copied={copied === 'install'}
              onCopy={() => handleCopy(installCommand, 'install')}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'preview'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Code
                <span className="text-[10px] tabular-nums px-1 py-px rounded bg-muted text-muted-foreground">
                  {codeFiles.length}
                </span>
              </button>
            </div>
          </div>

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Preview
                </span>
              </div>
              <div className="group/preview relative p-6 min-h-[400px] flex items-center justify-center bg-background">
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-foreground/80 text-background backdrop-blur-sm">
                    {block.name}
                  </span>
                </div>
                <BlockPreview blockName={block.name} />
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              {codeFiles.length > 1 && (
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {codeFiles.map((file, i) => (
                    <button
                      key={file.path}
                      onClick={() => setActiveFileIndex(i)}
                      className={`whitespace-nowrap text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                        i === activeFileIndex
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {file.path.split('/').pop()}
                      {file.isDemo && (
                        <span className="ml-1 text-[10px] text-muted-foreground">(demo)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {codeFiles[activeFileIndex] && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5">
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      {codeFiles[activeFileIndex].path}
                    </span>
                    <CopyButton
                      copied={copied === `file-${activeFileIndex}`}
                      onCopy={() =>
                        handleCopy(codeFiles[activeFileIndex].raw, `file-${activeFileIndex}`)
                      }
                    />
                  </div>
                  <div
                    className="overflow-auto max-h-[600px] [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 text-[13px]"
                    dangerouslySetInnerHTML={{ __html: codeFiles[activeFileIndex].html }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Dependencies */}
          {(block.dependencies?.length || block.registryDependencies?.length) ? (
            <div className="space-y-3 pt-2">
              {block.dependencies?.length ? (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1.5">npm Dependencies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {block.dependencies.map((dep) => (
                      <a
                        key={dep}
                        href={`https://www.npmjs.com/package/${dep}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded-md border border-border bg-muted/50 font-mono hover:bg-accent transition-colors"
                      >
                        {dep}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {block.registryDependencies?.length ? (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1.5">shadcn/ui Components</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {block.registryDependencies.map((dep) => (
                      <span key={dep} className="text-xs px-2 py-0.5 rounded-md border border-border bg-muted/50 font-mono">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer Nav */}
      <footer className="border-t border-border bg-background px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            {prev && (
              <Link href={`/blocks/${prev.name}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                &larr; {prev.title}
              </Link>
            )}
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            All Blocks
          </Link>
          <div>
            {next && (
              <Link href={`/blocks/${next.name}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {next.title} &rarr;
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

function BlockPreview({ blockName }: { blockName: string }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setComponent(null)

    import('@/lib/block-manifest')
      .then((mod) => {
        const comp = mod.blockComponents[blockName]
        if (comp) {
          setComponent(() => comp)
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [blockName])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground animate-pulse">
        Loading preview...
      </div>
    )
  }

  if (error || !Component) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Preview not available
      </div>
    )
  }

  return (
    <div className="w-full">
      <ErrorBoundary fallback={<div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Component failed to render</div>}>
        <Component />
      </ErrorBoundary>
    </div>
  )
}

function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      onClick={onCopy}
      className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          Copied
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          Copy
        </>
      )}
    </button>
  )
}

class ErrorBoundary extends ReactComponent<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
