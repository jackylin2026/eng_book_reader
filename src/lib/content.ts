import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
}

export function htmlToText(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

export function createSnippet(text: string, query: string, maxLength = 160): string {
  if (!text) return ''
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return text.slice(0, maxLength)

  const index = text.toLowerCase().indexOf(normalizedQuery)
  if (index < 0) return text.slice(0, maxLength)

  const start = Math.max(0, index - Math.floor(maxLength / 3))
  const end = Math.min(text.length, start + maxLength)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return `${prefix}${text.slice(start, end)}${suffix}`
}
