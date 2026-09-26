function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function inline(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
}

export function renderMarkdown(md: string): string {
  if (!md) return ""
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let inList: "ul" | "ol" | null = null
  let inCode = false
  let codeLang = ""
  let codeBuf: string[] = []

  function closeList() {
    if (inList) { out.push(inList === "ul" ? "</ul>" : "</ol>"); inList = null }
  }

  function closeCode() {
    if (inCode) {
      const lang = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ""
      out.push(`<pre><code${lang}>${escapeHtml(codeBuf.join("\n"))}</code></pre>`)
      inCode = false
      codeLang = ""
      codeBuf = []
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) { closeCode(); continue }
      inCode = true
      codeLang = line.trim().slice(3)
      continue
    }
    if (inCode) { codeBuf.push(line); continue }

    if (/^\s*$/.test(line)) { closeList(); out.push("<p></p>"); continue }

    const h3 = line.match(/^### (.+)/)
    if (h3) { closeList(); out.push(`<h3>${inline(h3[1])}</h3>`); continue }
    const h2 = line.match(/^## (.+)/)
    if (h2) { closeList(); out.push(`<h2>${inline(h2[1])}</h2>`); continue }
    const h1 = line.match(/^# (.+)/)
    if (h1) { closeList(); out.push(`<h1>${inline(h1[1])}</h1>`); continue }

    const bullet = line.match(/^\s*[-*] (.+)/)
    if (bullet) {
      if (inList !== "ul") { closeList(); inList = "ul"; out.push("<ul>") }
      out.push(`<li>${inline(bullet[1])}</li>`)
      continue
    }
    const num = line.match(/^\s*\d+\. (.+)/)
    if (num) {
      if (inList !== "ol") { closeList(); inList = "ol"; out.push("<ol>") }
      out.push(`<li>${inline(num[1])}</li>`)
      continue
    }

    closeList()
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  closeCode()

  return out.join("")
}