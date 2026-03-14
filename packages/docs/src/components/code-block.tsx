'use client'

import { useState } from 'react'

interface CodeBlockProps {
  html: string
  raw: string
  filename?: string
}

export function CodeBlock({ html, raw, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden my-4">
      {filename && (
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
          <span className="text-xs text-muted-foreground font-mono">{filename}</span>
          <CopyBtn copied={copied} onCopy={handleCopy} />
        </div>
      )}
      <div className="relative">
        {!filename && (
          <div className="absolute top-2 right-2 z-10">
            <CopyBtn copied={copied} onCopy={handleCopy} />
          </div>
        )}
        <div
          className="overflow-auto max-h-[500px] [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 text-[13px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

function CopyBtn({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      onClick={onCopy}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
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
