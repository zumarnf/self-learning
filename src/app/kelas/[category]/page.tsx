import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Badge, Eyebrow } from '@/components/ui/primitives';
import {
  allCategoryParams,
  categoryLessonCount,
  categoryMinutes,
  chapterMinutes,
  findCategory,
  writtenLessonCount,
} from '@/lib/curriculum/queries';
import { formatDuration } from '@/lib/utils/format';

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return allCategoryParams();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findCategory(slug);
  if (!category) return { title: 'Kategori tidak ditemukan' };
  return { title: category.title, description: category.description };
}

/** Chapter list for one category. */
export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = findCategory(slug);

  // A slug that does not exist must 404, not render an empty page.
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <nav aria-label="Breadcrumb" className="text-faint text-xs">
        <Link href="/kelas" className="hover:text-muted">
          Kelas
        </Link>
        <span aria-hidden="true"> › </span>
        <span className="text-muted">{category.title}</span>
      </nav>

      <header className="mt-4">
        <Eyebrow>Tahap {category.order}</Eyebrow>
        <h1 className="text-text mt-2 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          {category.title}
        </h1>
        <p className="text-muted mt-3 max-w-prose font-serif text-[1.02rem] leading-relaxed">
          {category.description}
        </p>
        <p className="tabular text-faint mt-4 text-xs">
          {category.chapters.length} bab · {categoryLessonCount(category)} sub-bab · ±{' '}
          {formatDuration(categoryMinutes(category))}
        </p>
      </header>

      <ul className="mt-10 space-y-3">
        {category.chapters.map((chapter) => {
          const written = writtenLessonCount(chapter);
          return (
            <li key={chapter.slug}>
              <Link
                href={`/kelas/${category.slug}/${chapter.slug}`}
                className="group border-border bg-surface hover:border-border-strong duration-fast flex gap-5 rounded-lg border p-5 transition-colors"
              >
                <span
                  className="tabular text-faint mt-0.5 shrink-0 font-sans text-2xl font-light"
                  aria-hidden="true"
                >
                  {chapter.number}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="text-text font-sans text-base font-medium">{chapter.title}</h2>
                  <p className="text-muted mt-1.5 max-w-prose font-serif text-[0.98rem] leading-relaxed">
                    {chapter.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="tabular text-faint text-xs">
                      {chapter.lessons.length} sub-bab · ± {formatDuration(chapterMinutes(chapter))}
                    </span>
                    {written === 0 ? (
                      <Badge tone="neutral">Materi belum ditulis</Badge>
                    ) : written < chapter.lessons.length ? (
                      <Badge tone="warning">
                        {written}/{chapter.lessons.length} sub-bab tertulis
                      </Badge>
                    ) : (
                      <Badge tone="accent">Materi lengkap</Badge>
                    )}
                    {chapter.quiz ? (
                      <Badge tone="neutral">{chapter.quiz.length} soal kuis</Badge>
                    ) : null}
                  </div>
                </div>

                <ChevronRightIcon
                  size={16}
                  className="text-faint duration-fast mt-1 shrink-0 self-start transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
