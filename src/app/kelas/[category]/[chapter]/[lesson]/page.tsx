import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlockRenderer, headingId } from '@/components/content/block-renderer';
import { LessonActions, NoteEditor } from '@/components/learning/lesson-actions';
import { TableOfContents } from '@/components/layout/table-of-contents';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from '@/components/ui/icons';
import { parseInline, stripInline } from '@/lib/content/parse-inline';
import { allLessonParams, findLesson, getNeighbours } from '@/lib/curriculum/queries';
import { formatDate } from '@/lib/utils/format';

type Params = { params: Promise<{ category: string; chapter: string; lesson: string }> };

export function generateStaticParams() {
  return allLessonParams();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, chapter, lesson } = await params;
  const found = findLesson(category, chapter, lesson);
  if (!found) return { title: 'Sub-bab tidak ditemukan' };
  return {
    title: `${found.number} ${stripInline(found.lesson.title)}`,
    description: found.lesson.summary,
  };
}

/**
 * The lesson page — the reason the whole application exists.
 *
 * A Server Component. Prose, code, callouts and tables are rendered to HTML at build time and
 * ship zero JavaScript; only the footer actions, note editor, and any interactive block inside
 * the lesson hydrate on the client.
 */
export default async function LessonPage({ params }: Params) {
  const { category: categorySlug, chapter: chapterSlug, lesson: lessonSlug } = await params;
  const found = findLesson(categorySlug, chapterSlug, lessonSlug);

  if (!found) notFound();

  const { category, chapter, lesson, number, key } = found;
  const { previous, next } = getNeighbours(key);

  const headings =
    lesson.status === 'written'
      ? lesson.blocks
          .filter((block) => block.kind === 'heading' && block.level === 2)
          .map((block) => {
            const heading = block as Extract<typeof block, { kind: 'heading' }>;
            return { id: headingId(heading), text: heading.text };
          })
      : [];

  return (
    <div className="mx-auto flex max-w-[1180px] gap-10 px-4 py-8 md:px-8 md:py-12">
      <article className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb" className="text-faint text-xs">
          <Link href={`/kelas/${category.slug}`} className="hover:text-muted">
            {category.title}
          </Link>
          <span aria-hidden="true"> › </span>
          <Link href={`/kelas/${category.slug}/${chapter.slug}`} className="hover:text-muted">
            {chapter.title}
          </Link>
        </nav>

        <header className="mt-5">
          {/* The lesson number sits large and light beside the title — a print-journal touch that
              also makes position in the chapter readable at a glance. */}
          <div className="flex items-baseline gap-4">
            <span className="tabular text-faint font-sans text-3xl font-light" aria-hidden="true">
              {number}
            </span>
            <h1 className="text-text font-sans text-2xl leading-tight font-semibold tracking-tight md:text-[1.75rem]">
              {parseInline(lesson.title)}
            </h1>
          </div>
          <p className="tabular text-faint mt-3 text-xs">
            ± {lesson.minutes} menit · {chapter.stackVersions.join(' · ')} · ditinjau{' '}
            {formatDate(chapter.reviewedAt)}
          </p>
        </header>

        {lesson.status === 'written' ? (
          <div className="prose-lesson mt-8">
            <BlockRenderer blocks={lesson.blocks} />
          </div>
        ) : (
          <NotWrittenYet outline={lesson.outline} summary={lesson.summary} />
        )}

        <hr className="border-border my-10 border-t" />

        <section aria-label="Catatan pribadi">
          <NoteEditor lessonKey={key} />
        </section>

        <section aria-label="Status sub-bab" className="mt-8">
          <LessonActions lessonKey={key} />
        </section>

        <nav
          aria-label="Navigasi sub-bab"
          className="border-border mt-10 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-between"
        >
          {previous ? (
            <Link
              href={`/kelas/${previous.category.slug}/${previous.chapter.slug}/${previous.lesson.slug}`}
              className="group text-muted hover:bg-raised hover:text-text duration-fast flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
            >
              <ChevronLeftIcon size={15} className="text-faint shrink-0" />
              <span className="min-w-0">
                <span className="text-2xs text-faint block">Sebelumnya</span>
                <span className="tabular block truncate">
                  {previous.number} {stripInline(previous.lesson.title)}
                </span>
              </span>
            </Link>
          ) : (
            <span className="text-faint px-3 py-2 text-sm" aria-disabled="true">
              Ini sub-bab pertama
            </span>
          )}

          {next ? (
            <Link
              href={`/kelas/${next.category.slug}/${next.chapter.slug}/${next.lesson.slug}`}
              className="group text-muted hover:bg-raised hover:text-text duration-fast flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors sm:justify-end"
            >
              <span className="min-w-0">
                <span className="text-2xs text-faint block">Berikutnya</span>
                <span className="tabular block truncate">
                  {next.number} {stripInline(next.lesson.title)}
                </span>
              </span>
              <ChevronRightIcon size={15} className="text-faint shrink-0" />
            </Link>
          ) : (
            <span className="text-faint px-3 py-2 text-sm" aria-disabled="true">
              Ini sub-bab terakhir
            </span>
          )}
        </nav>
      </article>

      {headings.length > 0 ? (
        <aside className="sticky top-20 hidden h-fit w-52 shrink-0 xl:block">
          <TableOfContents headings={headings} />
        </aside>
      ) : null}
    </div>
  );
}

/**
 * Explicit "not written yet" state.
 *
 * The curriculum is complete as a structure long before it is complete as text, and a blank page
 * would read as a bug. Showing the planned outline keeps the promise visible and still tells the
 * reader something useful (FR-2.7).
 */
function NotWrittenYet({ outline, summary }: { outline: string[]; summary: string }) {
  return (
    <div className="mt-8">
      <p className="text-muted max-w-prose font-serif text-[1.02rem] leading-relaxed">{summary}</p>

      <div className="border-border mt-6 rounded-lg border border-dashed px-5 py-4">
        <p className="text-2xs text-muted flex items-center gap-2 font-semibold tracking-[0.08em] uppercase">
          <PencilIcon size={14} />
          Belum ditulis
        </p>
        <p className="text-text mt-2 font-serif text-[0.98rem] leading-relaxed">
          Materi sub-bab ini belum ditulis. Yang akan dibahas di sini:
        </p>
        <ul className="mt-3 space-y-1.5">
          {outline.map((point, index) => (
            <li
              key={index}
              className="text-muted flex gap-2.5 font-serif text-[0.98rem] leading-relaxed"
            >
              <span aria-hidden="true" className="bg-faint mt-2.5 h-px w-3 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
