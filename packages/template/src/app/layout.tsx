import type { Metadata } from 'next'
import './globals.css'
import { registry } from '@/lib/registry'

export const metadata: Metadata = {
  title: `${registry.name} — Registry`,
  description: `Component registry for ${registry.name}`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen bg-background text-foreground flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
