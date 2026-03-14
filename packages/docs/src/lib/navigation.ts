export interface NavItem {
  title: string
  href: string
  items?: NavItem[]
}

export const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    items: [
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Getting Started', href: '/docs/getting-started' },
    ],
  },
  {
    title: 'Usage',
    href: '/docs/cli-reference',
    items: [
      { title: 'CLI Reference', href: '/docs/cli-reference' },
      { title: 'Configuration', href: '/docs/configuration' },
      { title: 'Custom Templates', href: '/docs/custom-templates' },
      { title: 'Registry Format', href: '/docs/registry-format' },
    ],
  },
]
