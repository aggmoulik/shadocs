'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ThemeTokens, RadiusTokens } from './theme-editor/theme-presets'
import { presets, defaultRadius } from './theme-editor/theme-presets'

export type ColorMode = 'light' | 'dark' | 'system'

interface ThemeState {
  light: ThemeTokens
  dark: ThemeTokens
  radius: RadiusTokens
  presetName: string | null
  mode: ColorMode
  fontFamily: string
  fontSize: string
}

interface ThemeContextValue {
  state: ThemeState
  isDark: boolean
  mode: ColorMode
  setMode: (mode: ColorMode) => void
  setToken: (mode: 'light' | 'dark', key: keyof ThemeTokens, value: string) => void
  setRadius: (key: keyof RadiusTokens, value: string) => void
  applyPreset: (presetName: string) => void
  resetTheme: () => void
  activeTokens: ThemeTokens
  fontFamily: string
  setFontFamily: (value: string) => void
  fontSize: string
  setFontSize: (value: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

const STORAGE_KEY = 'shadocs-theme'
const defaultPreset = presets[0]
const DEFAULT_FONT_FAMILY = 'system-ui, -apple-system, sans-serif'
const DEFAULT_FONT_SIZE = '16px'

function getInitialState(): ThemeState {
  return {
    light: { ...defaultPreset.light },
    dark: { ...defaultPreset.dark },
    radius: { ...defaultPreset.radius },
    presetName: 'default',
    mode: 'system',
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
  }
}

function applyTokensToDOM(tokens: ThemeTokens, radius: RadiusTokens) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--color-${key}`, value)
  }
  for (const [key, value] of Object.entries(radius)) {
    root.style.setProperty(`--${key}`, value)
  }
}

function clearDOMTokens(tokens: ThemeTokens, radius: RadiusTokens) {
  const root = document.documentElement
  for (const key of Object.keys(tokens)) {
    root.style.removeProperty(`--color-${key}`)
  }
  for (const key of Object.keys(radius)) {
    root.style.removeProperty(`--${key}`)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>(getInitialState)
  const [isDark, setIsDark] = useState(false)
  const [systemDark, setSystemDark] = useState(false)

  // Detect system dark mode preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Resolve isDark from mode + system preference
  useEffect(() => {
    if (state.mode === 'system') {
      setIsDark(systemDark)
    } else {
      setIsDark(state.mode === 'dark')
    }
  }, [state.mode, systemDark])

  // Toggle .dark class on <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ThemeState
        // Backfill new fields for old saved states
        if (!parsed.mode) parsed.mode = 'system'
        if (!parsed.fontFamily) parsed.fontFamily = DEFAULT_FONT_FAMILY
        if (!parsed.fontSize) parsed.fontSize = DEFAULT_FONT_SIZE
        setState(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Apply tokens to DOM whenever state or dark mode changes
  useEffect(() => {
    const tokens = isDark ? state.dark : state.light
    applyTokensToDOM(tokens, state.radius)
  }, [state, isDark])

  // Apply typography to DOM
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('font-family', state.fontFamily)
    root.style.setProperty('font-size', state.fontSize)
  }, [state.fontFamily, state.fontSize])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const setMode = useCallback((mode: ColorMode) => {
    setState((prev) => ({ ...prev, mode }))
  }, [])

  const setToken = useCallback((mode: 'light' | 'dark', key: keyof ThemeTokens, value: string) => {
    setState((prev) => ({
      ...prev,
      presetName: null,
      [mode]: { ...prev[mode], [key]: value },
    }))
  }, [])

  const setRadius = useCallback((key: keyof RadiusTokens, value: string) => {
    setState((prev) => ({
      ...prev,
      presetName: null,
      radius: { ...prev.radius, [key]: value },
    }))
  }, [])

  const applyPreset = useCallback((presetName: string) => {
    const preset = presets.find((p) => p.name === presetName)
    if (!preset) return
    setState((prev) => ({
      ...prev,
      light: { ...preset.light },
      dark: { ...preset.dark },
      radius: { ...preset.radius },
      presetName: preset.name,
    }))
  }, [])

  const setFontFamily = useCallback((value: string) => {
    setState((prev) => ({ ...prev, fontFamily: value }))
  }, [])

  const setFontSize = useCallback((value: string) => {
    setState((prev) => ({ ...prev, fontSize: value }))
  }, [])

  const resetTheme = useCallback(() => {
    const initial = getInitialState()
    setState(initial)
    clearDOMTokens(defaultPreset.light, defaultRadius)
    document.documentElement.style.removeProperty('font-family')
    document.documentElement.style.removeProperty('font-size')
    document.documentElement.classList.remove('dark')
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const activeTokens = isDark ? state.dark : state.light

  return (
    <ThemeContext.Provider
      value={{
        state, isDark, mode: state.mode, setMode,
        setToken, setRadius, applyPreset, resetTheme, activeTokens,
        fontFamily: state.fontFamily, setFontFamily,
        fontSize: state.fontSize, setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
