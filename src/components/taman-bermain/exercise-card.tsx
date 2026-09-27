'use client';

import Link from 'next/link';
import { Badge, Card } from '@/components/ui/primitives';
import { parseInline } from '@/lib/content/parse-inline';
import type { ExerciseSummary } from '@/lib/taman-bermain/types';

export type CardStatus = 'belum' | 'dicoba' | 'benar';

/**
 * One exercise in the index.
 *
 * Two lines here carry more weight than they look:
 *
 *   - the engine label, because it tells the reader what KIND of certainty they will get before
 *     they open the exercise rather than after they are disappointed (FR-TB-13)
 *   - `realWorldUse`, which answers the question every exercise sheet ever written has provoked:
 *     when would I actually use this? Because the field is required and test-enforced, it is
 *     answered on all forty, not on the ones whose author felt like it (FR-TB-16)
 */
export function ExerciseCard({
  exercise,
  status,
  attempts,
  chapterTitle,
}: {
  exercise: ExerciseSummary;
  status: CardStatus;
  attempts: number;
  chapterTitle: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-faint text-xs">{chapterTitle}</p>
        {status === 'benar' ? (
          <Badge tone="accent">Benar</Badge>
        ) : status === 'dicoba' ? (
          <Badge tone="warning">Pernah dicoba</Badge>
        ) : (
          <Badge tone="neutral">Belum dikerjakan</Badge>
        )}
      </div>

      <h2 className="mt-1">
        <Link
          href={`/taman-bermain/${exercise.slug}`}
          className="text-text hover:text-primary font-sans text-base font-medium"
        >
          {parseInline(exercise.title)}
        </Link>
      </h2>

      <p className="text-faint mt-1 text-xs">
        {exercise.topic} · {exercise.level === 'basic' ? 'Basic' : 'Intermediate'} ·{' '}
        {exercise.engine === 'js' ? 'dijalankan' : 'diperiksa strukturnya'}
      </p>

      <p className="text-muted mt-2 text-sm">
        <span className="text-faint">Dipakai untuk:</span> {parseInline(exercise.realWorldUse)}
      </p>

      {attempts > 0 ? (
        <p className="tabular text-faint mt-2 text-xs">{attempts}× percobaan</p>
      ) : null}
    </Card>
  );
}
