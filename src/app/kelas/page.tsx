import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Eyebrow } from '@/components/ui/primitives';
import {
  categoryLessonCount,
  categoryMinutes,
  getCurriculum,
  totalChapterCount,
  totalLessonCount,
} from '@/lib/curriculum/queries';
import { formatDuration } from '@/lib/utils/format';

export const metadata: Metadata = {
  title: 'Kelas',
  description:
    'Lima kategori kurikulum Fullstack Developer, dari JavaScript dasar sampai deployment.',
};

/**
 * Category index. A Server Component: it is pure curriculum data, so it ships no JavaScript.
 * Per-category progress deliberately lives on the Dashboard instead — putting it here would
 * force the whole page into the client bundle for a number the reader just saw.
 */
export default function KelasPage() {
  const curriculum = getCurriculum();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Kurikulum</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Lima tahap, dari nol sampai produksi
        </h1>
        <p className="tabular text-muted mt-3 max-w-prose">
          {totalChapterCount()} bab · {totalLessonCount()} sub-bab. Urutannya bukan acak — tiap
          kategori mengandalkan yang sebelumnya.
        </p>
      </header>

      <ul className="mt-10 space-y-3">
        {curriculum.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/kelas/${category.slug}`}
              className="group border-border bg-surface hover:border-border-strong duration-fast flex gap-5 rounded-lg border p-5 transition-colors"
            >
              <span
                className="tabular border-border bg-raised text-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-sans text-sm"
                aria-hidden="true"
              >
                {category.order}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-text font-sans text-lg font-medium">{category.title}</h2>
                  <span className="text-2xs text-faint tracking-[0.08em] uppercase">
                    {category.tagline}
                  </span>
                </div>
                <p className="text-muted mt-2 max-w-prose font-serif text-[0.98rem] leading-relaxed">
                  {category.description}
                </p>
                <p className="tabular text-faint mt-3 text-xs">
                  {category.chapters.length} bab · {categoryLessonCount(category)} sub-bab · ±{' '}
                  {formatDuration(categoryMinutes(category))}
                </p>
              </div>

              <ChevronRightIcon
                size={16}
                className="text-faint duration-fast mt-1 shrink-0 self-start transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
