'use client';

import Link from 'next/link';
import { ProgressBar } from '@/components/learning/progress';
import { Badge, Eyebrow, Skeleton } from '@/components/ui/primitives';
import { categoryProgress } from '@/lib/learning/derive';
import { useLearningStore } from '@/lib/learning/store';
import type { RoadmapCategory } from './page';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

/**
 * Roadmap: the five categories as an ordered path.
 *
 * The connecting line is dashed ahead of you and solid behind — position in the path is readable
 * without counting percentages. Stages are never locked: prerequisites are advice, not a gate,
 * because an adult studying alone can decide to skip ahead.
 */
export function RoadmapClient({ categories }: { categories: RoadmapCategory[] }) {
  const { data, hydrated } = useLearningStore();
  const curriculum = categories;

  const currentIndex = hydrated
    ? curriculum.findIndex((category) => categoryProgress(data, category).percent < 100)
    : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Alur belajar</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Roadmap
        </h1>
        <p className="text-muted mt-3 max-w-prose">
          Lima tahap berurutan. Kamu boleh melompat, tapi tiap tahap ditulis dengan asumsi tahap
          sebelumnya sudah dipahami.
        </p>
      </header>

      <ol className="mt-10">
        {curriculum.map((category, index) => {
          const progress = hydrated
            ? categoryProgress(data, category)
            : { done: 0, total: category.lessonCount, percent: 0 };
          const isCurrent = hydrated && index === currentIndex;
          const isDone = hydrated && progress.percent === 100;
          const isPast = hydrated && index < currentIndex;
          const isLast = index === curriculum.length - 1;

          return (
            <li key={category.slug} className="relative flex gap-5 pb-8 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-7 left-[11px] h-[calc(100%-1.75rem)] w-px',
                    isPast || isDone ? 'bg-primary-fill' : 'border-border border-l border-dashed',
                  )}
                />
              ) : null}

              <span
                aria-hidden="true"
                className={cn(
                  'bg-bg relative mt-1 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border-2',
                  isDone || isPast
                    ? 'border-primary-fill bg-primary-fill'
                    : isCurrent
                      ? 'border-primary-fill'
                      : 'border-border',
                )}
              >
                {isCurrent ? <span className="bg-primary-fill h-2 w-2 rounded-full" /> : null}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Link
                    href={`/kelas/${category.slug}`}
                    className="text-text hover:text-primary font-sans text-lg font-medium"
                  >
                    Tahap {category.order} · {category.title}
                  </Link>
                  {isCurrent ? <Badge tone="primary">Kamu di sini</Badge> : null}
                  {isDone ? <Badge tone="accent">Selesai</Badge> : null}
                </div>

                <p className="tabular text-faint mt-1.5 text-xs">
                  {category.chapterTitles.length} bab · {category.lessonCount} sub-bab · ±{' '}
                  {formatDuration(category.minutes)}
                </p>

                {hydrated ? (
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar
                      progress={progress}
                      label={category.title}
                      className="max-w-xs flex-1"
                    />
                    <span className="tabular text-muted text-xs">{progress.percent}%</span>
                  </div>
                ) : (
                  <Skeleton className="mt-3 h-1.5 max-w-xs" />
                )}

                <p className="text-muted mt-3 text-xs">{category.chapterTitles.join(' → ')}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
