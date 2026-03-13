import type { Metadata } from 'next'
import { registry } from '@/lib/registry'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeEditor } from '@/components/theme-editor/theme-editor'
import './globals.css'

export const metadata: Metadata = {
  title: `${registry.name} — Blocks`,
  description: `Block components from ${registry.name}`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <ThemeEditor />
        </ThemeProvider>
      </body>
    </html>
  )
}
