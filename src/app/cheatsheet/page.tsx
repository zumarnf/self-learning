import type { Metadata } from 'next';
import { CopyButton } from '@/components/content/copy-button';
import { Eyebrow } from '@/components/ui/primitives';
import { CHEATSHEET_GROUPS, cheatsheets } from '@/content/cheatsheets';
import { parseInline } from '@/lib/content/parse-inline';

export const metadata: Metadata = {
  title: 'Cheatsheet',
  description:
    'Rujukan cepat sintaks dan perintah untuk seluruh kurikulum, dari JavaScript, React, dan Next.js sampai SQL, Docker, CI/CD, keamanan, system design, dan Claude Code.',
};

/** Inline code inside a note, in the same code tokens as the lessons, sized for small text. */
const INLINE_CODE =
  '[&_code]:bg-code-bg [&_code]:border-code-border [&_code]:rounded-sm [&_code]:border [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.95em]';

/**
 * All cheatsheets on one scrollable page.
 *
 * Deliberately not split into sub-routes: the whole point is looking something up in seconds, and
 * `Ctrl+F` across one page beats navigating a menu. Server-rendered, so it costs no JavaScript
 * beyond the copy buttons.
 *
 * The navigation is grouped because a flat row of twenty chips is a wall to scan; the groups
 * follow the curriculum's areas so a reader finds a sheet where they found the lesson.
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
          Yang sering dicari ulang sambil mengetik. Penjelasannya ada di materi, di sini hanya
          bentuknya. Tekan <kbd className="font-mono text-xs">Ctrl+F</kbd> untuk mencari di seluruh
          halaman.
        </p>
      </header>

      <nav aria-label="Daftar cheatsheet" className="mt-8 space-y-4">
        {CHEATSHEET_GROUPS.map((group, i) => (
          <div key={group} className="sm:flex sm:items-baseline sm:gap-4">
            <p
              id={`kelompok-${i}`}
              className="text-2xs text-faint mb-1.5 font-medium tracking-[0.1em] uppercase sm:mb-0 sm:w-44 sm:shrink-0"
            >
              {group}
            </p>
            <ul aria-labelledby={`kelompok-${i}`} className="flex flex-wrap gap-1.5">
              {cheatsheets
                .filter((sheet) => sheet.group === group)
                .map((sheet) => (
                  <li key={sheet.slug}>
                    <a
                      href={`#${sheet.slug}`}
                      className="border-border text-muted hover:bg-raised hover:text-text duration-fast inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors pointer-coarse:min-h-11 pointer-coarse:px-3"
                    >
                      {sheet.title}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {cheatsheets.map((sheet) => (
          <section key={sheet.slug} id={sheet.slug} className="scroll-mt-24">
            <p className="text-2xs text-faint font-medium tracking-[0.1em] uppercase">
              {sheet.group}
            </p>
            <h2 className="text-text mt-1 font-sans text-lg font-semibold">{sheet.title}</h2>
            <p className={`text-muted mt-1 text-sm ${INLINE_CODE}`}>{parseInline(sheet.summary)}</p>

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
                        <span className={`text-muted min-w-0 flex-1 text-xs ${INLINE_CODE}`}>
                          {parseInline(row.note)}
                        </span>
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
