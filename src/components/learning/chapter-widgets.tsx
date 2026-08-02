'use client';

import { CheckIcon, RepeatIcon } from '@/components/ui/icons';
import { ProgressBar } from '@/components/learning/progress';
import type { ProgressCategory, ProgressChapter } from '@/lib/learning/derive';
import { chapterProgress } from '@/lib/learning/derive';
import { useLearningStore } from '@/lib/learning/store';

/**
 * Two small client islands used by the server-rendered chapter page.
 *
 * They exist so that the chapter page itself can stay a Server Component: only the parts that
 * actually read stored progress cross into the client bundle (SDD §2.3).
 */

export function ChapterProgressNote({
  category,
  chapter,
  chapterTitle,
}: {
  /* Slim projections passed from the Server Component — see the note in queries.ts. */
  category: ProgressCategory;
  chapter: ProgressChapter;
  chapterTitle: string;
}) {
  const { data, hydrated } = useLearningStore();

  // Render nothing rather than a zero: an unhydrated "0%" would be wrong information, and a
  // skeleton for one line of text is more noise than the line itself.
  if (!hydrated) return null;

  const progress = chapterProgress(data, category, chapter);

  return (
    <div className="mt-5 flex items-center gap-3">
      <ProgressBar
        progress={progress}
        label={`Progres bab ${chapterTitle}`}
        className="max-w-xs flex-1"
      />
      <span className="tabular text-muted text-xs">
        {progress.done}/{progress.total} selesai
      </span>
    </div>
  );
}

export function LessonStatusMark({ lessonKey }: { lessonKey: string }) {
  const { data, hydrated } = useLearningStore();

  if (!hydrated) {
    return <span className="h-4 w-4 shrink-0" aria-hidden="true" />;
  }

  const state = data.lessons[lessonKey];

  if (state?.completedAt) {
    return (
      <span className="text-accent shrink-0" title="Selesai">
        <CheckIcon size={14} />
        <span className="sr-only">Selesai</span>
      </span>
    );
  }

  if (state?.needsReview) {
    return (
      <span className="text-primary shrink-0" title="Perlu diulang">
        <RepeatIcon size={13} />
        <span className="sr-only">Perlu diulang</span>
      </span>
    );
  }

  return <span className="h-4 w-4 shrink-0" aria-hidden="true" />;
}
