import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChecklistBlock } from '@/components/learning/checklist-block';
import { QuizBlock } from '@/components/learning/quiz-block';
import { ChapterProgressNote, LessonStatusMark } from '@/components/learning/chapter-widgets';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Badge, Eyebrow } from '@/components/ui/primitives';
import {
  allChapterParams,
  chapterMinutes,
  findCategory,
  findChapter,
} from '@/lib/curriculum/queries';
import { chapterKey } from '@/lib/curriculum/types';
import { formatDate, formatDuration } from '@/lib/utils/format';

type Params = { params: Promise<{ category: string; chapter: string }> };

export function generateStaticParams() {
  return allChapterParams();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, chapter: chapterSlug } = await params;
  const chapter = findChapter(category, chapterSlug);
  if (!chapter) return { title: 'Bab tidak ditemukan' };
  return { title: chapter.title, description: chapter.summary };
}

/**
 * Chapter overview: objectives, prerequisites, lesson list, quiz, and practice checklist.
 *
 * Server-rendered apart from three islands — progress marks, quiz, and checklist — which are the
 * only parts that depend on stored data.
 */
export default async function ChapterPage({ params }: Params) {
  const { category: categorySlug, chapter: chapterSlug } = await params;
  const category = findCategory(categorySlug);
  const chapter = findChapter(categorySlug, chapterSlug);

  if (!category || !chapter) notFound();

  const key = chapterKey(category.slug, chapter.slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <nav aria-label="Breadcrumb" className="text-faint text-xs">
        <Link href="/kelas" className="hover:text-muted">
          Kelas
        </Link>
        <span aria-hidden="true"> › </span>
        <Link href={`/kelas/${category.slug}`} className="hover:text-muted">
          {category.title}
        </Link>
      </nav>

      <header className="mt-4">
        <Eyebrow>Bab {chapter.number}</Eyebrow>
        <h1 className="text-text mt-2 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          {chapter.title}
        </h1>
        <p className="text-muted mt-3 max-w-prose font-serif text-[1.02rem] leading-relaxed">
          {chapter.summary}
        </p>

        <div className="text-faint mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="tabular">
            {chapter.lessons.length} sub-bab · ± {formatDuration(chapterMinutes(chapter))}
          </span>
          <span>Merujuk: {chapter.stackVersions.join(' · ')}</span>
          <span>Ditinjau {formatDate(chapter.reviewedAt)}</span>
        </div>

        <ChapterProgressNote
          category={{
            slug: category.slug,
            chapters: [
              { slug: chapter.slug, lessons: chapter.lessons.map((l) => ({ slug: l.slug })) },
            ],
          }}
          chapter={{ slug: chapter.slug, lessons: chapter.lessons.map((l) => ({ slug: l.slug })) }}
          chapterTitle={chapter.title}
        />
      </header>

      <section className="border-border bg-surface mt-8 rounded-lg border p-5">
        <h2 className="text-text font-sans text-sm font-semibold">Setelah bab ini kamu bisa</h2>
        <ul className="mt-3 space-y-1.5">
          {chapter.objectives.map((objective, index) => (
            <li
              key={index}
              className="text-muted flex gap-2.5 font-serif text-[0.98rem] leading-relaxed"
            >
              <span aria-hidden="true" className="bg-faint mt-2.5 h-px w-3 shrink-0" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>

        {chapter.prerequisites.length > 0 ? (
          <p className="border-border text-muted mt-4 border-t pt-4 text-xs">
            Prasyarat:{' '}
            {chapter.prerequisites.map((prerequisite, index) => {
              const target = findChapter(prerequisite.category, prerequisite.chapter);
              return (
                <span key={`${prerequisite.category}/${prerequisite.chapter}`}>
                  {index > 0 ? ', ' : ''}
                  {target ? (
                    <Link
                      href={`/kelas/${prerequisite.category}/${prerequisite.chapter}`}
                      className="text-primary underline underline-offset-2"
                    >
                      {target.title}
                    </Link>
                  ) : (
                    prerequisite.chapter
                  )}
                </span>
              );
            })}
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="text-text font-sans text-sm font-semibold">Sub-bab</h2>
        <ul className="divide-border border-border mt-3 divide-y overflow-hidden rounded-lg border">
          {chapter.lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/kelas/${category.slug}/${chapter.slug}/${lesson.slug}`}
                className="group hover:bg-raised duration-fast flex items-center gap-3 px-4 py-3 transition-colors"
              >
                <LessonStatusMark lessonKey={`${category.slug}/${chapter.slug}/${lesson.slug}`} />
                <span className="tabular text-faint w-10 shrink-0 text-xs">
                  {chapter.number}.{lesson.index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-text block truncate text-sm">{lesson.title}</span>
                  <span className="text-faint mt-0.5 block truncate text-xs">{lesson.summary}</span>
                </span>
                {lesson.status === 'outline' ? (
                  <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
                    Belum ditulis
                  </Badge>
                ) : null}
                <span className="tabular text-faint hidden w-16 shrink-0 text-right text-xs sm:block">
                  ± {lesson.minutes} mnt
                </span>
                <ChevronRightIcon
                  size={14}
                  className="text-faint duration-fast shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {chapter.practice ? (
        <ChecklistBlock
          id={chapter.practice.id}
          title={chapter.practice.title}
          items={chapter.practice.items}
          storageKey={key}
        />
      ) : null}

      {chapter.quiz ? (
        <QuizBlock
          id={`${key}/quiz`}
          questions={chapter.quiz}
          storageKey={key}
          title={`Kuis Bab ${chapter.number}`}
        />
      ) : null}
    </div>
  );
}
