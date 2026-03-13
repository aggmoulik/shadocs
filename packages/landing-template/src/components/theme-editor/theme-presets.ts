export interface ThemeTokens {
  background: string
  foreground: string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  card: string
  'card-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
  popover: string
  'popover-foreground': string
}

export interface RadiusTokens {
  'radius-sm': string
  'radius-md': string
  'radius-lg': string
  'radius-xl': string
}

export interface ThemePreset {
  name: string
  label: string
  color: string // Representative color for the preset selector
  light: ThemeTokens
  dark: ThemeTokens
  radius: RadiusTokens
}

export const defaultRadius: RadiusTokens = {
  'radius-sm': '0.25rem',
  'radius-md': '0.375rem',
  'radius-lg': '0.5rem',
  'radius-xl': '0.75rem',
}

export const presets: ThemePreset[] = [
  {
    name: 'default',
    label: 'Default',
    color: '#171717',
    light: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      primary: '#171717',
      'primary-foreground': '#fafafa',
      secondary: '#f5f5f5',
      'secondary-foreground': '#171717',
      muted: '#f5f5f5',
      'muted-foreground': '#737373',
      accent: '#f5f5f5',
      'accent-foreground': '#171717',
      card: '#ffffff',
      'card-foreground': '#0a0a0a',
      destructive: '#ef4444',
      'destructive-foreground': '#fafafa',
      border: '#e5e5e5',
      input: '#e5e5e5',
      ring: '#0a0a0a',
      popover: '#ffffff',
      'popover-foreground': '#0a0a0a',
    },
    dark: {
      background: '#09090b',
      foreground: '#fafafa',
      primary: '#fafafa',
      'primary-foreground': '#09090b',
      secondary: '#27272a',
      'secondary-foreground': '#fafafa',
      muted: '#18181b',
      'muted-foreground': '#a1a1aa',
      accent: '#18181b',
      'accent-foreground': '#fafafa',
      card: '#09090b',
      'card-foreground': '#fafafa',
      destructive: '#7f1d1d',
      'destructive-foreground': '#fafafa',
      border: '#27272a',
      input: '#27272a',
      ring: '#d4d4d8',
      popover: '#09090b',
      'popover-foreground': '#fafafa',
    },
    radius: defaultRadius,
  },
  {
    name: 'blue',
    label: 'Blue',
    color: '#2563eb',
    light: {
      background: '#ffffff',
      foreground: '#020817',
      primary: '#2563eb',
      'primary-foreground': '#f8fafc',
      secondary: '#f1f5f9',
      'secondary-foreground': '#0f172a',
      muted: '#f1f5f9',
      'muted-foreground': '#64748b',
      accent: '#f1f5f9',
      'accent-foreground': '#0f172a',
      card: '#ffffff',
      'card-foreground': '#020817',
      destructive: '#ef4444',
      'destructive-foreground': '#f8fafc',
      border: '#e2e8f0',
      input: '#e2e8f0',
      ring: '#2563eb',
      popover: '#ffffff',
      'popover-foreground': '#020817',
    },
    dark: {
      background: '#020817',
      foreground: '#f8fafc',
      primary: '#3b82f6',
      'primary-foreground': '#020817',
      secondary: '#1e293b',
      'secondary-foreground': '#f8fafc',
      muted: '#1e293b',
      'muted-foreground': '#94a3b8',
      accent: '#1e293b',
      'accent-foreground': '#f8fafc',
      card: '#020817',
      'card-foreground': '#f8fafc',
      destructive: '#7f1d1d',
      'destructive-foreground': '#f8fafc',
      border: '#1e293b',
      input: '#1e293b',
      ring: '#3b82f6',
      popover: '#020817',
      'popover-foreground': '#f8fafc',
    },
    radius: defaultRadius,
  },
  {
    name: 'green',
    label: 'Green',
    color: '#16a34a',
    light: {
      background: '#ffffff',
      foreground: '#052e16',
      primary: '#16a34a',
      'primary-foreground': '#f0fdf4',
      secondary: '#f0fdf4',
      'secondary-foreground': '#052e16',
      muted: '#f0fdf4',
      'muted-foreground': '#4b5563',
      accent: '#dcfce7',
      'accent-foreground': '#052e16',
      card: '#ffffff',
      'card-foreground': '#052e16',
      destructive: '#ef4444',
      'destructive-foreground': '#fafafa',
      border: '#d1d5db',
      input: '#d1d5db',
      ring: '#16a34a',
      popover: '#ffffff',
      'popover-foreground': '#052e16',
    },
    dark: {
      background: '#030712',
      foreground: '#f9fafb',
      primary: '#22c55e',
      'primary-foreground': '#030712',
      secondary: '#1f2937',
      'secondary-foreground': '#f9fafb',
      muted: '#1f2937',
      'muted-foreground': '#9ca3af',
      accent: '#1f2937',
      'accent-foreground': '#f9fafb',
      card: '#030712',
      'card-foreground': '#f9fafb',
      destructive: '#7f1d1d',
      'destructive-foreground': '#f9fafb',
      border: '#1f2937',
      input: '#1f2937',
      ring: '#22c55e',
      popover: '#030712',
      'popover-foreground': '#f9fafb',
    },
    radius: defaultRadius,
  },
  {
    name: 'rose',
    label: 'Rose',
    color: '#e11d48',
    light: {
      background: '#ffffff',
      foreground: '#1c1917',
      primary: '#e11d48',
      'primary-foreground': '#fff1f2',
      secondary: '#f5f5f4',
      'secondary-foreground': '#1c1917',
      muted: '#f5f5f4',
      'muted-foreground': '#78716c',
      accent: '#ffe4e6',
      'accent-foreground': '#1c1917',
      card: '#ffffff',
      'card-foreground': '#1c1917',
      destructive: '#ef4444',
      'destructive-foreground': '#fafafa',
      border: '#e7e5e4',
      input: '#e7e5e4',
      ring: '#e11d48',
      popover: '#ffffff',
      'popover-foreground': '#1c1917',
    },
    dark: {
      background: '#0c0a09',
      foreground: '#fafaf9',
      primary: '#fb7185',
      'primary-foreground': '#0c0a09',
      secondary: '#292524',
      'secondary-foreground': '#fafaf9',
      muted: '#292524',
      'muted-foreground': '#a8a29e',
      accent: '#292524',
      'accent-foreground': '#fafaf9',
      card: '#0c0a09',
      'card-foreground': '#fafaf9',
      destructive: '#7f1d1d',
      'destructive-foreground': '#fafaf9',
      border: '#292524',
      input: '#292524',
      ring: '#fb7185',
      popover: '#0c0a09',
      'popover-foreground': '#fafaf9',
    },
    radius: defaultRadius,
  },
  {
    name: 'orange',
    label: 'Orange',
    color: '#ea580c',
    light: {
      background: '#ffffff',
      foreground: '#1a1a1a',
      primary: '#ea580c',
      'primary-foreground': '#fff7ed',
      secondary: '#f5f5f5',
      'secondary-foreground': '#1a1a1a',
      muted: '#f5f5f5',
      'muted-foreground': '#737373',
      accent: '#ffedd5',
      'accent-foreground': '#1a1a1a',
      card: '#ffffff',
      'card-foreground': '#1a1a1a',
      destructive: '#ef4444',
      'destructive-foreground': '#fafafa',
      border: '#e5e5e5',
      input: '#e5e5e5',
      ring: '#ea580c',
      popover: '#ffffff',
      'popover-foreground': '#1a1a1a',
    },
    dark: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      primary: '#f97316',
      'primary-foreground': '#0a0a0a',
      secondary: '#262626',
      'secondary-foreground': '#fafafa',
      muted: '#262626',
      'muted-foreground': '#a3a3a3',
      accent: '#262626',
      'accent-foreground': '#fafafa',
      card: '#0a0a0a',
      'card-foreground': '#fafafa',
      destructive: '#7f1d1d',
      'destructive-foreground': '#fafafa',
      border: '#262626',
      input: '#262626',
      ring: '#f97316',
      popover: '#0a0a0a',
      'popover-foreground': '#fafafa',
    },
    radius: defaultRadius,
  },
]

// Font family options
export const fontFamilyOptions = [
  { label: 'System', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Geist', value: 'Geist, system-ui, sans-serif' },
  { label: 'Mono', value: 'JetBrains Mono, ui-monospace, monospace' },
  { label: 'Serif', value: 'Georgia, Cambria, serif' },
] as const

// Semantic grouping for the editor UI
export const tokenGroups = [
  { label: 'Base', tokens: ['background', 'foreground'] },
  { label: 'Primary', tokens: ['primary', 'primary-foreground'] },
  { label: 'Secondary', tokens: ['secondary', 'secondary-foreground'] },
  { label: 'Muted', tokens: ['muted', 'muted-foreground'] },
  { label: 'Accent', tokens: ['accent', 'accent-foreground'] },
  { label: 'Card', tokens: ['card', 'card-foreground'] },
  { label: 'Popover', tokens: ['popover', 'popover-foreground'] },
  { label: 'Destructive', tokens: ['destructive', 'destructive-foreground'] },
  { label: 'Border & Input', tokens: ['border', 'input', 'ring'] },
] as const

export function exportThemeCSS(
  light: ThemeTokens,
  dark: ThemeTokens,
  radius: RadiusTokens,
  fontFamily?: string,
  fontSize?: string
): string {
  const lightLines = Object.entries(light)
    .map(([k, v]) => `  --color-${k}: ${v};`)
    .join('\n')
  const radiusLines = Object.entries(radius)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')
  const darkLines = Object.entries(dark)
    .map(([k, v]) => `    --color-${k}: ${v};`)
    .join('\n')

  let css = `@theme {
${lightLines}
${radiusLines}
}

@media (prefers-color-scheme: dark) {
  :root {
${darkLines}
  }
}`

  if (fontFamily || fontSize) {
    const bodyLines: string[] = []
    if (fontFamily) bodyLines.push(`  font-family: ${fontFamily};`)
    if (fontSize) bodyLines.push(`  font-size: ${fontSize};`)
    css += `\n\nbody {\n${bodyLines.join('\n')}\n}`
  }

  return css
}
