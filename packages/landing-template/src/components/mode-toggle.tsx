'use client'

import { useTheme, type ColorMode } from './theme-provider'

const MODE_CYCLE: ColorMode[] = ['system', 'light', 'dark']

export function ModeToggle() {
  const { mode, setMode, isDark } = useTheme()

  const cycle = () => {
    const idx = MODE_CYCLE.indexOf(mode)
    setMode(MODE_CYCLE[(idx + 1) % MODE_CYCLE.length])
  }

  return (
    <button
      onClick={cycle}
      className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={`Theme: ${mode}`}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      )}
    </button>
  )
}
