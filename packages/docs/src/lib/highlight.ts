import { codeToHtml } from 'shiki'

export async function highlight(code: string, lang: string = 'bash') {
  return codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  })
}
