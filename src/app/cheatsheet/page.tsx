import type { Metadata } from 'next';
import { CopyButton } from '@/components/content/copy-button';
import { Eyebrow } from '@/components/ui/primitives';
import { cheatsheets } from '@/content/cheatsheets';

export const metadata: Metadata = {
  title: 'Cheatsheet',
  description:
    'Rujukan cepat sintaks dan perintah: JavaScript, React, Tailwind, SQL, Express, Laravel, Git, Docker.',
};

/**
 * All cheatsheets on one scrollable page.
 *
 * Deliberately not split into sub-routes: the whole point is looking something up in seconds, and
 * `Ctrl+F` across one page beats navigating a menu. Server-rendered, so it costs no JavaScript
 * beyond the copy buttons.
 */
export default function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Rujukan cepat</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Cheatsheet
        </h1>
        <p className="text-muted mt-3 max-w-prose">
          Yang sering dicari ulang sambil mengetik. Penjelasannya ada di materi — di sini hanya
          bentuknya.
        </p>
      </header>

      <nav aria-label="Daftar cheatsheet" className="mt-6 flex flex-wrap gap-1.5">
        {cheatsheets.map((sheet) => (
          <a
            key={sheet.slug}
            href={`#${sheet.slug}`}
            className="border-border text-muted hover:bg-raised hover:text-text duration-fast rounded-md border px-2.5 py-1 text-xs transition-colors"
          >
            {sheet.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {cheatsheets.map((sheet) => (
          <section key={sheet.slug} id={sheet.slug} className="scroll-mt-24">
            <h2 className="text-text font-sans text-lg font-semibold">{sheet.title}</h2>
            <p className="text-muted mt-1 text-sm">{sheet.summary}</p>

            <div className="mt-5 space-y-6">
              {sheet.sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-2xs text-faint font-medium tracking-[0.1em] uppercase">
                    {section.title}
                  </h3>
                  <ul className="divide-border border-border mt-2 divide-y overflow-hidden rounded-md border">
                    {section.rows.map((row) => (
                      <li
                        key={row.code}
                        className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <code className="scroll-x text-text shrink-0 font-mono text-xs whitespace-pre sm:w-[52%]">
                          {row.code}
                        </code>
                        <span className="text-muted min-w-0 flex-1 text-xs">{row.note}</span>
                        <span className="shrink-0">
                          <CopyButton value={row.code} label="potongan" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
