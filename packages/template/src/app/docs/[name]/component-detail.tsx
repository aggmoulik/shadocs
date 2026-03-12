'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatType } from '@/lib/registry'

interface HighlightedFile {
  path: string
  type: string
  html: string
  raw: string
}

interface HighlightedExample {
  name: string
  title?: string
  html: string
  raw: string
}

interface ItemData {
  name: string
  type: string
  title?: string
  description?: string
  author?: string
  docs?: string
  categories?: string[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  fileCount: number
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
}

interface SidebarItem {
  name: string
  title: string
}

interface ComponentDetailProps {
  item: ItemData
  registryName: string
  installCommand: string
  highlightedFiles: HighlightedFile[]
  highlightedExamples: HighlightedExample[]
  sidebarItems: SidebarItem[]
  currentName: string
}

type Tab = 'preview' | 'code' | 'info'

export function ComponentDetail({
  item,
  registryName,
  installCommand,
  highlightedFiles,
  highlightedExamples,
  sidebarItems,
  currentName,
}: ComponentDetailProps) {
  const hasExamples = highlightedExamples.length > 0
  const hasCode = highlightedFiles.length > 0

  const [activeTab, setActiveTab] = useState<Tab>(hasExamples ? 'preview' : 'code')
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [activeExampleIndex, setActiveExampleIndex] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const tabs: { id: Tab; label: string; count?: number; show: boolean }[] = [
    { id: 'preview', label: 'Preview', count: highlightedExamples.length, show: hasExamples },
    { id: 'code', label: 'Code', count: highlightedFiles.length, show: hasCode },
    { id: 'info', label: 'Info', show: true },
  ]
  const visibleTabs = tabs.filter((t) => t.show)

  const formatExampleName = (name: string) => {
    const cleaned = name
      .replace(`${item.name}-`, '')
      .replace(/^demo$/, 'Default')
      .replace(/^demo-/, 'Variant ')
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-muted/30">
        <div className="px-4 py-4 border-b border-border">
          <Link href="/" className="text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
            {registryName}
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Components</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {sidebarItems.map((si) => (
            <Link
              key={si.name}
              href={`/docs/${si.name}`}
              className={`block px-4 py-1.5 text-xs transition-colors ${
                si.name === currentName
                  ? 'text-foreground font-medium bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {si.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                {registryName}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{item.name}</span>
            </nav>

            {/* Header */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {item.title || item.name}
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase">
                  {formatType(item.type)}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              )}
            </div>

            {/* Install command */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 font-mono text-xs">
              <span className="text-muted-foreground select-none">$</span>
              <code className="flex-1 overflow-x-auto">{installCommand}</code>
              <CopyButton text={installCommand} copied={copied === 'install'} onCopy={() => handleCopy(installCommand, 'install')} />
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex gap-0">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="text-[10px] tabular-nums px-1 py-px rounded bg-muted text-muted-foreground">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="flex gap-6">
                {/* Example sidebar */}
                {highlightedExamples.length > 1 && (
                  <div className="hidden sm:block w-40 shrink-0 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-2 mb-2">
                      Examples
                    </p>
                    {highlightedExamples.map((ex, i) => (
                      <button
                        key={ex.name}
                        onClick={() => setActiveExampleIndex(i)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                          i === activeExampleIndex
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        {formatExampleName(ex.name)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Example code */}
                <div className="flex-1 min-w-0">
                  {/* Mobile example selector */}
                  {highlightedExamples.length > 1 && (
                    <div className="sm:hidden flex gap-1 overflow-x-auto pb-3">
                      {highlightedExamples.map((ex, i) => (
                        <button
                          key={ex.name}
                          onClick={() => setActiveExampleIndex(i)}
                          className={`whitespace-nowrap text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                            i === activeExampleIndex
                              ? 'bg-accent text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent/50'
                          }`}
                        >
                          {formatExampleName(ex.name)}
                        </button>
                      ))}
                    </div>
                  )}

                  {highlightedExamples[activeExampleIndex] && (
                    <CodeViewer
                      filename={`${highlightedExamples[activeExampleIndex].name}.tsx`}
                      html={highlightedExamples[activeExampleIndex].html}
                      raw={highlightedExamples[activeExampleIndex].raw}
                      copied={copied === `ex-${activeExampleIndex}`}
                      onCopy={() =>
                        handleCopy(
                          highlightedExamples[activeExampleIndex].raw,
                          `ex-${activeExampleIndex}`
                        )
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-4">
                {highlightedFiles.length > 1 && (
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {highlightedFiles.map((file, i) => (
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
                      </button>
                    ))}
                  </div>
                )}

                {highlightedFiles[activeFileIndex] && (
                  <CodeViewer
                    filename={highlightedFiles[activeFileIndex].path}
                    html={highlightedFiles[activeFileIndex].html}
                    raw={highlightedFiles[activeFileIndex].raw}
                    copied={copied === `file-${activeFileIndex}`}
                    onCopy={() =>
                      handleCopy(
                        highlightedFiles[activeFileIndex].raw,
                        `file-${activeFileIndex}`
                      )
                    }
                  />
                )}
              </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6 max-w-2xl">
                {item.docs && (
                  <InfoSection title="Documentation">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {item.docs}
                    </div>
                  </InfoSection>
                )}

                {item.categories?.length ? (
                  <InfoSection title="Categories">
                    <div className="flex flex-wrap gap-1.5">
                      {item.categories.map((cat) => (
                        <span key={cat} className="text-xs px-2 py-0.5 rounded-md border border-border bg-muted/50">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </InfoSection>
                ) : null}

                {item.dependencies?.length ? (
                  <InfoSection title="Dependencies">
                    <div className="flex flex-wrap gap-1.5">
                      {item.dependencies.map((dep) => (
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
                  </InfoSection>
                ) : null}

                {item.registryDependencies?.length ? (
                  <InfoSection title="Registry Dependencies">
                    <div className="flex flex-wrap gap-1.5">
                      {item.registryDependencies.map((dep) => (
                        <span key={dep} className="text-xs px-2 py-0.5 rounded-md border border-border bg-muted/50 font-mono">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </InfoSection>
                ) : null}

                {item.cssVars && Object.keys(item.cssVars).length > 0 && (
                  <InfoSection title="CSS Variables">
                    {Object.entries(item.cssVars).map(([mode, vars]) =>
                      vars && Object.keys(vars).length > 0 ? (
                        <div key={mode} className="mb-3">
                          <h4 className="text-xs text-muted-foreground mb-1.5 capitalize">{mode}</h4>
                          <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-xs">
                              <tbody>
                                {Object.entries(vars).map(([key, value]) => (
                                  <tr key={key} className="border-b border-border last:border-0">
                                    <td className="p-2 font-mono text-muted-foreground">{key}</td>
                                    <td className="p-2 font-mono">{value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : null
                    )}
                  </InfoSection>
                )}

                {item.author && (
                  <InfoSection title="Author">
                    <p className="text-sm text-muted-foreground">{item.author}</p>
                  </InfoSection>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground flex items-center justify-between shrink-0">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to {registryName}
          </Link>
          <span>Generated by shadocs</span>
        </div>
      </div>
    </div>
  )
}

function CodeViewer({
  filename,
  html,
  raw,
  copied,
  onCopy,
}: {
  filename: string
  html: string
  raw: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5">
        <span className="text-xs text-muted-foreground font-mono truncate">
          {filename}
        </span>
        <CopyButton text={raw} copied={copied} onCopy={onCopy} />
      </div>
      <div
        className="overflow-auto max-h-[600px] [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 text-[13px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function CopyButton({
  text,
  copied,
  onCopy,
}: {
  text: string
  copied: boolean
  onCopy: () => void
}) {
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

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}
