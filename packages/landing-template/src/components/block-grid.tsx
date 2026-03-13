'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Component as ReactComponent } from 'react'

interface BlockInfo {
  name: string
  title: string
  description?: string
  fileCount: number
}

interface BlockGridProps {
  blocks: BlockInfo[]
}

export function BlockGrid({ blocks }: BlockGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {blocks.map((block) => (
        <BlockCard key={block.name} block={block} />
      ))}
    </div>
  )
}

function BlockCard({ block }: { block: BlockInfo }) {
  const router = useRouter()

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/blocks/${block.name}`)}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/blocks/${block.name}`) }}
      className="group rounded-xl border border-border overflow-hidden hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
    >
      {/* Preview */}
      <div className="relative bg-background border-b border-border">
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-foreground/80 text-background backdrop-blur-sm">
            {block.name}
          </span>
        </div>
        <div className="h-[300px] overflow-hidden">
          <LazyBlockPreview blockName={block.name} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-muted/20">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors truncate">
              {block.title}
            </h3>
            {block.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {block.description}
              </p>
            )}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          {block.fileCount} {block.fileCount === 1 ? 'file' : 'files'}
        </div>
      </div>
    </div>
  )
}

function LazyBlockPreview({ blockName }: { blockName: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState(false)

  // Intersection observer for lazy loading
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Load component when visible
  useEffect(() => {
    if (!isVisible) return

    import('@/lib/block-manifest')
      .then((mod) => {
        const comp = mod.blockComponents[blockName]
        if (comp) {
          setComponent(() => comp)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
  }, [isVisible, blockName])

  return (
    <div ref={ref} className="w-full h-full">
      {!isVisible || (!Component && !error) ? (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground animate-pulse">
          Loading...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
          Preview unavailable
        </div>
      ) : Component ? (
        <div className="origin-top-left scale-[0.5] w-[200%] pointer-events-none">
          <ErrorBoundary fallback={<PreviewError />}>
            <Component />
          </ErrorBoundary>
        </div>
      ) : null}
    </div>
  )
}

function PreviewError() {
  return (
    <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">
      Preview failed to render
    </div>
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
