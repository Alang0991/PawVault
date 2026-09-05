import { Buffer } from "buffer"

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "del",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "code", "pre", "kbd", "samp", "var",
  "a", "span", "div", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "caption", "colgroup", "col",
  "details", "summary",
  "sub", "sup",
  "abbr", "cite", "q", "dfn",
  "small",
  "mark",
])

const SELF_CLOSING = new Set([
  "br", "hr", "img", "area", "base", "col", "embed",
  "input", "link", "meta", "param", "source", "track", "wbr",
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  span: new Set(["style", "class"]),
  div: new Set(["style", "class"]),
  p: new Set(["style", "class"]),
  figure: new Set(["style", "class"]),
  figcaption: new Set(["style", "class"]),
  code: new Set(["style", "class"]),
  pre: new Set(["style", "class"]),
  details: new Set(["style", "class"]),
  summary: new Set(["style", "class"]),
  table: new Set(["style", "class", "width"]),
  th: new Set(["style", "class"]),
  td: new Set(["style", "class"]),
  col: new Set(["span", "style"]),
  colgroup: new Set(["style", "class"]),
  blockquote: new Set(["style", "class", "cite"]),
  abbr: new Set(["title"]),
  q: new Set(["cite"]),
}

const BLOCKED_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "applet",
  "meta", "link", "base", "form", "input", "button", "textarea",
  "select", "option", "svg", "math", "video", "audio",
  "source", "track", "canvas", "map", "area",
  "frame", "frameset", "noscript",
])

function isSafeUrl(url: string): boolean {
  if (!url) return true
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith("javascript:")) return false
  if (trimmed.startsWith("data:")) {
    // Only allow non-SVG data images to prevent XSS via embedded scripts.
    // SVG data URLs can contain <script> tags and event handlers.
    return trimmed.match(/^data:image\/(png|jpg|jpeg|gif|webp|avif|bmp|tiff|ico)(;|$)/) !== null
  }
  if (trimmed.startsWith("vbscript:")) return false
  if (trimmed.startsWith("file:")) return false
  return true
}

/**
 * Sanitize an HTML string by removing dangerous tags, attributes, and URLs.
 * Preserves legitimate rich-text formatting.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  let processed = html

  // Remove <script>...</script> blocks (case-insensitive, including content)
  processed = processed.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  )

  // Remove other blocked tags entirely (just strip the tag, keep content for most,
  // but for script/style/iframe etc. we already handled script; for the rest strip tag only)
  for (const tag of BLOCKED_TAGS) {
    if (tag === "script") continue // already handled above
    // Remove opening tags
    processed = processed.replace(
      new RegExp(`<${tag}\\b[^>]*>`, "gi"),
      "",
    )
    // Remove closing tags
    processed = processed.replace(
      new RegExp(`</${tag}\\s*>`, "gi"),
      "",
    )
  }

  // Remove event handler attributes (on*) and other dangerous attrs
  processed = processed.replace(/\s(on\w+|on-\w+)=("|')?[^"' >]*\1?/gi, "")

  // Remove javascript: and similar from href/src attributes
  processed = processed.replace(
    /\s(href|src)\s*=\s*("|')?\s*(javascript:|vbscript:|data:text\/html)/gi,
    ' x-',
  )

  // Sanitize attributes on allowed tags
  processed = processed.replace(
    /<(\/?)(\w+)([^>]*)>/g,
    (_, closing, tagName, attrs) => {
      const tag = tagName.toLowerCase()

      if (closing === "/") {
        if (SELF_CLOSING.has(tag)) {
          return ""
        }
        if (!ALLOWED_TAGS.has(tag)) {
          return ""
        }
        return `</${tag}>`
      }

      if (!ALLOWED_TAGS.has(tag)) {
        return ""
      }

      const allowed = ALLOWED_ATTRS[tag]
      if (!allowed) {
        return `<${tag}>`
      }

      const sanitizedAttrs = attrs
        .split(/\s+/)
        .filter((a: string) => a && a.includes("="))
        .map((pair: string) => {
          const eqIdx = pair.indexOf("=")
          const attrName = pair.slice(0, eqIdx).toLowerCase().trim()
          const attrValueRaw = pair.slice(eqIdx + 1).trim()
          let attrValue = attrValueRaw

          // Remove surrounding quotes
          if (
            (attrValueRaw.startsWith('"') && attrValueRaw.endsWith('"')) ||
            (attrValueRaw.startsWith("'") && attrValueRaw.endsWith("'"))
          ) {
            attrValue = attrValueRaw.slice(1, -1)
          }

          // Skip event handlers
          if (/^on/i.test(attrName)) return ""
          if (attrName === "style") {
            // Only allow safe CSS properties
            if (isSafeStyle(attrValue)) {
              return `style="${escapeHtmlAttr(attrValue)}"`
            }
            return ""
          }
          if (attrName === "class") {
            // Only allow alphanumeric, dash, underscore for class names
            if (/^[a-zA-Z0-9-_ ]+$/.test(attrValue)) {
              return `class="${escapeHtmlAttr(attrValue)}"`
            }
            return ""
          }

          if (attrName === "target" && attrValue.toLowerCase() === "_blank") {
            return 'target="_blank" rel="noopener noreferrer"'
          }

          if (!allowed.has(attrName)) return ""

          if ((attrName === "href" || attrName === "src") && !isSafeUrl(attrValue)) {
            return ""
          }

          return `${attrName}="${escapeHtmlAttr(attrValue)}"`
        })
        .filter(Boolean)
        .join(" ")

      if (SELF_CLOSING.has(tag)) {
        return `<${tag}${sanitizedAttrs ? " " + sanitizedAttrs : ""} />`
      }
      return `<${tag}${sanitizedAttrs ? " " + sanitizedAttrs : ""}>`
    },
  )

  return processed
}

function isSafeStyle(css: string): boolean {
  if (!css) return true
  // Only allow basic text styling properties
  const allowedProperties = new Set([
    "color", "background", "background-color", "font-size", "font-weight",
    "font-family", "text-align", "text-decoration", "text-transform",
    "margin", "padding", "border", "width", "height",
    "display", "list-style", "list-style-type",
  ])

  const declarations = css.split(";").map((d) => d.trim()).filter(Boolean)
  for (const decl of declarations) {
    const prop = decl.split(":")[0]?.trim().toLowerCase()
    if (!prop || !allowedProperties.has(prop)) return false
    if (/expression|javascript:|url\(/i.test(decl)) return false
  }
  return true
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Server-side helper: sanitize post content before rendering.
 * Use in server components/pages, not client components.
 */
export function sanitizePostContent(content: string): string {
  return sanitizeHtml(content)
}

/**
 * Validate that a social link is a safe URL.
 * Returns the URL if safe, or null if it should be removed.
 */
export function sanitizeSocialUrl(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!isSafeUrl(trimmed)) return null
  // Must be a proper web URL
  if (!/^https?:\/\//i.test(trimmed)) return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== "http:" && u.protocol !== "https:") return null
    return trimmed
  } catch {
    return null
  }
}
