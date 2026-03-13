'use client'

import { useState, useCallback } from 'react'
import { useTheme, type ColorMode } from '../theme-provider'
import { ColorPicker } from './color-picker'
import { RadiusSlider } from './radius-slider'
import { presets, tokenGroups, fontFamilyOptions, exportThemeCSS } from './theme-presets'
import type { ThemeTokens, RadiusTokens } from './theme-presets'

function CollapsibleSection({
  label,
  defaultOpen = false,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full text-left group mb-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-neutral-600 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider group-hover:text-neutral-300 transition-colors">
          {label}
        </span>
      </button>
      {open && <div className="space-y-2 pl-3">{children}</div>}
    </div>
  )
}

const MODE_CYCLE: ColorMode[] = ['system', 'light', 'dark']

function ModeIcon({ mode }: { mode: ColorMode }) {
  if (mode === 'light') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    )
  }
  // system
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
  )
}

export function ThemeEditor() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const {
    state, isDark, mode, setMode,
    setToken, setRadius, applyPreset, resetTheme,
    fontFamily, setFontFamily, fontSize, setFontSize,
  } = useTheme()

  const colorMode = isDark ? 'dark' : 'light'
  const tokens = state[colorMode]

  const handleCopyCSS = useCallback(async () => {
    const css = exportThemeCSS(state.light, state.dark, state.radius, state.fontFamily, state.fontSize)
    await navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [state])

  const cycleMode = () => {
    const idx = MODE_CYCLE.indexOf(mode)
    setMode(MODE_CYCLE[(idx + 1) % MODE_CYCLE.length])
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-[100] w-10 h-10 rounded-full bg-neutral-900 text-white shadow-lg
          flex items-center justify-center hover:bg-neutral-800 transition-colors border border-neutral-700"
        title="Theme Editor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20a8 8 0 0 0 8-8 4 4 0 0 0-4-4H8a4 4 0 0 0-4 4 8 8 0 0 0 8 8Z"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      </button>

      {/* Backdrop — transparent, no blur so background stays visible */}
      {open && (
        <div
          className="fixed inset-0 z-[100]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[101] h-full w-80 bg-neutral-950 border-l border-neutral-800
          shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 shrink-0">
          <h2 className="text-sm font-semibold text-white">Theme Editor</h2>
          <div className="flex items-center gap-1.5">
            {/* Mode toggle */}
            <button
              onClick={cycleMode}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title={`Mode: ${mode}`}
            >
              <ModeIcon mode={mode} />
              <span className="text-xs capitalize">{mode}</span>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-visible px-4 py-3 space-y-4">
          {/* Presets */}
          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Presets</h3>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.name)}
                  className="flex flex-col items-center gap-1 group"
                  title={preset.label}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      state.presetName === preset.name
                        ? 'border-white scale-110'
                        : 'border-neutral-700 hover:border-neutral-500'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-[11px] text-neutral-500 group-hover:text-neutral-300 transition-colors">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <CollapsibleSection label="Typography" defaultOpen>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">Font Family</span>
                <div className="flex flex-wrap gap-1.5">
                  {fontFamilyOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setFontFamily(opt.value)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        fontFamily === opt.value
                          ? 'bg-white text-neutral-900 font-medium'
                          : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-neutral-400">Font Size</span>
                  <span className="text-xs font-mono text-neutral-300">{fontSize}</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="1"
                  value={parseInt(fontSize) || 16}
                  onChange={(e) => setFontSize(`${e.target.value}px`)}
                  className="w-full h-1.5 rounded-full appearance-none bg-neutral-700 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Color tokens — collapsible sections */}
          {tokenGroups.map((group, i) => (
            <CollapsibleSection
              key={group.label}
              label={group.label}
              defaultOpen={i < 2}
            >
              {group.tokens.map((tokenKey) => (
                <ColorPicker
                  key={tokenKey}
                  label={tokenKey}
                  value={tokens[tokenKey as keyof ThemeTokens]}
                  onChange={(v) => setToken(colorMode, tokenKey as keyof ThemeTokens, v)}
                />
              ))}
            </CollapsibleSection>
          ))}

          {/* Radius */}
          <CollapsibleSection label="Radius" defaultOpen>
            <div className="space-y-3">
              {(Object.keys(state.radius) as (keyof RadiusTokens)[]).map((key) => (
                <RadiusSlider
                  key={key}
                  label={key}
                  value={state.radius[key]}
                  onChange={(v) => setRadius(key, v)}
                />
              ))}
            </div>
          </CollapsibleSection>

          <div className="h-4" />
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-neutral-800 shrink-0 space-y-2">
          <button
            onClick={handleCopyCSS}
            className="w-full text-xs py-2 rounded-md bg-white text-neutral-900 font-medium hover:bg-neutral-200 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
          <button
            onClick={resetTheme}
            className="w-full text-xs py-2 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </>
  )
}
