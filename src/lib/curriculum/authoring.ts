import type { Block, QuizQuestion } from '@/lib/content/types';
import type { Category, CategorySlug, Chapter, ChapterRef, Lesson } from './types';

/**
 * Authoring helpers for the curriculum tree.
 *
 * `index` (the 1.1 / 1.2 numbering) is assigned here rather than typed by hand in every content
 * file. Hand-numbering 330 lessons guarantees a gap or a duplicate eventually, and the integrity
 * test would then fail on a mistake that never needed to be possible.
 */

/**
 * `Omit` collapses a union to its shared keys, which would erase the `blocks`/`outline` split in
 * `Lesson`. Distributing over the union first keeps both variants intact.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * A lesson before it is placed in a chapter. Exported so a long chapter can be split across
 * several content files and composed back together, without any of them having to know which
 * position their lessons will end up in.
 */
export type LessonDraft = DistributiveOmit<Lesson, 'index'>;

/** A lesson whose material is still an outline. One line per lesson in the content files. */
export function outline(
  slug: string,
  title: string,
  minutes: number,
  summary: string,
  ...points: string[]
): LessonDraft {
  return { slug, title, minutes, summary, status: 'outline', outline: points };
}

/** A lesson whose material is written. */
export function written(
  slug: string,
  title: string,
  minutes: number,
  summary: string,
  blocks: Block[],
): LessonDraft {
  return { slug, title, minutes, summary, status: 'written', blocks };
}

type ChapterInput = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  objectives: string[];
  prerequisites?: ChapterRef[];
  stackVersions: string[];
  reviewedAt: string;
  lessons: LessonDraft[];
  quiz?: QuizQuestion[];
  practice?: { id: string; title: string; items: string[] };
};

export function defineChapter(input: ChapterInput): Chapter {
  return {
    slug: input.slug,
    number: input.number,
    title: input.title,
    summary: input.summary,
    objectives: input.objectives,
    prerequisites: input.prerequisites ?? [],
    stackVersions: input.stackVersions,
    reviewedAt: input.reviewedAt,
    lessons: input.lessons.map((lesson, i) => ({ ...lesson, index: i + 1 }) as Lesson),
    ...(input.quiz === undefined ? {} : { quiz: input.quiz }),
    ...(input.practice === undefined ? {} : { practice: input.practice }),
  };
}

type CategoryInput = {
  slug: CategorySlug;
  order: number;
  title: string;
  tagline: string;
  description: string;
  chapters: Chapter[];
};

export function defineCategory(input: CategoryInput): Category {
  return input;
}

/** Shorthand for a multiple-choice question. */
export function q(
  id: string,
  question: string,
  options: string[],
  answerIndex: number,
  explanation: string,
): QuizQuestion {
  return { id, question, options, answerIndex, explanation };
}
