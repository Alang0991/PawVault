import Link from "next/link"

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  list?: string[]
}

export interface LegalDocument {
  title: string
  lastUpdated: string
  intro?: string
  sections: LegalSection[]
  backLabel: string
  backHref?: string
}

/**
 * One renderer for every legal and policy page.
 *
 * These pages previously each hand-rolled their own markup and relied on
 * Tailwind's `prose` utility, which is not enabled in this project — so
 * they were rendering as completely unstyled body text. This component
 * uses the same type scale and text tokens as the rest of PawVault, and
 * gives all five documents one consistent reading experience rather than
 * five slightly different ones. See the design direction §22.
 */
export function LegalPage({ document }: { document: LegalDocument }) {
  const { title, lastUpdated, intro, sections, backLabel, backHref = "/" } = document

  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-10">
        <article className="max-w-3xl">
          <header className="border-b border-border pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-text-muted">{lastUpdated}</p>
            {intro && (
              <p className="mt-4 leading-relaxed text-text-secondary">{intro}</p>
            )}
          </header>

          <nav aria-label="Policy sections" className="border-b border-border py-4">
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${slugify(section.heading)}`}
                    className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {sections.map((section) => (
            <section
              key={section.heading}
              id={slugify(section.heading)}
              className="scroll-mt-24 pt-8"
            >
              <h2 className="text-xl font-bold tracking-tight text-text-primary">
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-3 leading-relaxed text-text-secondary"
                >
                  {paragraph}
                </p>
              ))}

              {section.list && (
                <ul className="mt-3 list-inside list-disc space-y-1.5 leading-relaxed text-text-secondary">
                  {section.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <footer className="mt-12 border-t border-border pt-6">
            <Link
              href={backHref}
              className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
            >
              {backLabel}
            </Link>
          </footer>
        </article>
      </div>
    </div>
  )
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
