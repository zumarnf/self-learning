import type { Block, QuizQuestion } from '@/lib/content/types';

/**
 * Curriculum shape: Category → Chapter → Lesson.
 *
 * `slug` and `index` are separate on purpose. The URL uses the slug, the displayed number comes
 * from the index. Inserting a lesson in the middle of a chapter therefore renumbers the display
 * without breaking a bookmark or orphaning saved progress (SDD §4.2).
 */

export type CategorySlug =
  | 'frontend-basic'
  | 'frontend-intermediate'
  | 'backend-basic'
  | 'backend-intermediate'
  | 'deployment';

export type ChapterRef = {
  category: CategorySlug;
  chapter: string;
};

export type LessonStatus = 'written' | 'outline';

export type Lesson = {
  slug: string;
  /** 1-based position within the chapter. Displayed as `${chapter.number}.${index}`. */
  index: number;
  title: string;
  summary: string;
  /** Estimated reading time in minutes. Accumulated upward to chapter and category. */
  minutes: number;
} & (
  | { status: 'written'; blocks: Block[] }
  /** Not yet written. The outline is shown to the reader so the page is never blank (FR-2.7). */
  | { status: 'outline'; outline: string[] }
);

export type Chapter = {
  slug: string;
  /** 1-based position within the category. */
  number: number;
  title: string;
  summary: string;
  /** "After this chapter you can…" — concrete, checkable capabilities. */
  objectives: string[];
  prerequisites: ChapterRef[];
  /** Versions this chapter's material was written against, e.g. 'React 19.2'. */
  stackVersions: string[];
  /** ISO date of the last content review. Staleness is visible, not guessed. */
  reviewedAt: string;
  lessons: Lesson[];
  quiz?: QuizQuestion[];
  practice?: { id: string; title: string; items: string[] };
};

export type Category = {
  slug: CategorySlug;
  /** 1-based position in the learning path. */
  order: number;
  title: string;
  tagline: string;
  description: string;
  chapters: Chapter[];
};

export type Curriculum = Category[];

/** Stable key for a lesson in stored user data: `category/chapter/lesson`. */
export type LessonKey = string;

/** Stable key for a chapter in stored user data: `category/chapter`. */
export type ChapterKey = string;

export function lessonKey(category: CategorySlug, chapter: string, lesson: string): LessonKey {
  return `${category}/${chapter}/${lesson}`;
}

export function chapterKey(category: CategorySlug, chapter: string): ChapterKey {
  return `${category}/${chapter}`;
}

/** A lesson plus everything needed to render its page without re-walking the tree. */
export type LessonLocation = {
  category: Category;
  chapter: Chapter;
  lesson: Lesson;
  /** Display number, e.g. "2.4". */
  number: string;
  key: LessonKey;
};
