import { defineConfig } from 'shadocs'

export default defineConfig({
  "registry": {
    "source": "https://billingsdk.com/r/registry.json",
    "name": "billingsdk",
    "homepage": "https://billingsdk.com"
  },
  "site": {
    "title": "billingsdk Docs"
  },
  "nav": {
    "links": [
      {
        "title": "Homepage",
        "href": "https://billingsdk.com"
      }
    ]
  },
  "output": {
    "dir": "./out"
  }
})
