import { Sidebar } from '@/components/sidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex gap-10 py-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-22">
            <Sidebar />
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 max-w-3xl">
          {children}
        </main>
      </div>
    </div>
  )
}
