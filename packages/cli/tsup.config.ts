import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['bin/shadocs.ts'],
    format: ['esm'],
    clean: true,
    target: 'node18',
    splitting: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    target: 'node18',
    splitting: false,
  },
])
