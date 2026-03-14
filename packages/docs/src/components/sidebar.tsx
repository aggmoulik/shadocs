'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '@/lib/navigation'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {navigation.map((group) => (
        <div key={group.title}>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
            {group.title}
          </h4>
          <ul className="space-y-0.5">
            {group.items?.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
