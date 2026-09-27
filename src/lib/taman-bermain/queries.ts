import { getExerciseBank } from '@/content/taman-bermain';
import type { Exercise, ExerciseSummary, Level } from './types';

/**
 * Read access to the exercise bank. SERVER ONLY.
 *
 * This module reaches the content, so importing it from a Client Component would pull all forty
 * exercises — answer keys, alternative answers, rejected answers and every check spec — into the
 * browser bundle. `client-bundle-boundary.test.ts` enforces that it never happens.
 *
 * The projection below is the reason the boundary is affordable: the index page genuinely only
 * needs seven fields per exercise, so it gets exactly those.
 */

export function getExercises(): Exercise[] {
  return getExerciseBank();
}

/** Everything the index page may receive — deliberately without `solution` or `check`. */
export function getExerciseSummaries(): ExerciseSummary[] {
  return getExerciseBank().map((exercise) => ({
    slug: exercise.slug,
    title: exercise.title,
    topic: exercise.topic,
    level: exercise.level,
    realWorldUse: exercise.realWorldUse,
    engine: exercise.check.engine,
    source: exercise.source,
  }));
}

export function findExercise(slug: string): Exercise | undefined {
  return getExerciseBank().find((exercise) => exercise.slug === slug);
}

/** Neighbours for the previous/next controls, in bank order. */
export function getNeighbours(slug: string): {
  previous?: ExerciseSummary;
  next?: ExerciseSummary;
} {
  const all = getExerciseSummaries();
  const index = all.findIndex((exercise) => exercise.slug === slug);
  if (index === -1) return {};

  const previous = index > 0 ? all[index - 1] : undefined;
  const next = index < all.length - 1 ? all[index + 1] : undefined;

  return {
    ...(previous === undefined ? {} : { previous }),
    ...(next === undefined ? {} : { next }),
  };
}

/** Topics in the order they first appear, so the filter row follows the learning path. */
export function getTopics(): string[] {
  const seen: string[] = [];
  for (const exercise of getExerciseBank()) {
    if (!seen.includes(exercise.topic)) seen.push(exercise.topic);
  }
  return seen;
}

export function countByLevel(): Record<Level, number> {
  const counts: Record<Level, number> = { basic: 0, intermediate: 0 };
  for (const exercise of getExerciseBank()) counts[exercise.level] += 1;
  return counts;
}
