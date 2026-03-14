import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'shadocs',
    template: '%s - shadocs',
  },
  description: 'Generate beautiful documentation and landing pages from your shadcn component registry.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    S
                  </div>
                  <span className="text-sm font-semibold">shadocs</span>
                </Link>
                <nav className="hidden sm:flex items-center gap-4">
                  <Link href="/docs/getting-started" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Docs
                  </Link>
                  <a
                    href="https://github.com/moulikthedocs/shadocs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
