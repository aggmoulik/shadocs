import { defineConfig } from 'shadocs'

export default defineConfig({
  "registry": {
    "source": "https://magicui.design/r/registry.json",
    "name": "magicui",
    "homepage": "https://magicui.design"
  },
  "site": {
    "title": "magicui Docs"
  },
  "nav": {
    "links": [
      {
        "title": "Homepage",
        "href": "https://magicui.design"
      }
    ]
  },
  "output": {
    "dir": "./out"
  }
})
