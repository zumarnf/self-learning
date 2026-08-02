import { curriculum } from '@/content/curriculum';
import type { Category, CategorySlug, Chapter, Lesson, LessonKey, LessonLocation } from './types';
import { lessonKey } from './types';

/**
 * Read-only queries over the curriculum tree.
 *
 * This module knows nothing about user progress. Combining the two is the job of the component
 * layer — keeping the boundary means the whole curriculum can be reasoned about, and tested,
 * without touching storage (SDD §3).
 */

export function getCurriculum(): Category[] {
  return curriculum;
}

export function findCategory(slug: string): Category | undefined {
  return curriculum.find((category) => category.slug === slug);
}

export function findChapter(categorySlug: string, chapterSlug: string): Chapter | undefined {
  return findCategory(categorySlug)?.chapters.find((chapter) => chapter.slug === chapterSlug);
}

export function findLesson(
  categorySlug: string,
  chapterSlug: string,
  lessonSlug: string,
): LessonLocation | undefined {
  const category = findCategory(categorySlug);
  if (!category) return undefined;

  const chapter = category.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return undefined;

  const lesson = chapter.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;

  return {
    category,
    chapter,
    lesson,
    number: lessonNumber(chapter, lesson),
    key: lessonKey(category.slug, chapter.slug, lesson.slug),
  };
}

export function lessonNumber(chapter: Chapter, lesson: Lesson): string {
  return `${chapter.number}.${lesson.index}`;
}

/**
 * Every lesson in learning order. Built once per process — the curriculum is immutable at
 * runtime, so recomputing it per request would be pure waste.
 */
let flattened: LessonLocation[] | undefined;

export function flattenLessons(): LessonLocation[] {
  if (flattened) return flattened;

  const all: LessonLocation[] = [];
  for (const category of curriculum) {
    for (const chapter of category.chapters) {
      for (const lesson of chapter.lessons) {
        all.push({
          category,
          chapter,
          lesson,
          number: lessonNumber(chapter, lesson),
          key: lessonKey(category.slug, chapter.slug, lesson.slug),
        });
      }
    }
  }

  flattened = all;
  return all;
}

let indexByKey: Map<LessonKey, number> | undefined;

function getIndexByKey(): Map<LessonKey, number> {
  if (indexByKey) return indexByKey;
  const map = new Map<LessonKey, number>();
  flattenLessons().forEach((location, i) => map.set(location.key, i));
  indexByKey = map;
  return map;
}

/** Previous and next lesson in learning order — crossing chapter and category boundaries. */
export function getNeighbours(key: LessonKey): {
  previous: LessonLocation | undefined;
  next: LessonLocation | undefined;
} {
  const all = flattenLessons();
  const position = getIndexByKey().get(key);
  if (position === undefined) return { previous: undefined, next: undefined };

  return {
    previous: position > 0 ? all[position - 1] : undefined,
    next: position < all.length - 1 ? all[position + 1] : undefined,
  };
}

export function chapterMinutes(chapter: Chapter): number {
  return chapter.lessons.reduce((total, lesson) => total + lesson.minutes, 0);
}

export function categoryMinutes(category: Category): number {
  return category.chapters.reduce((total, chapter) => total + chapterMinutes(chapter), 0);
}

export function chapterLessonCount(chapter: Chapter): number {
  return chapter.lessons.length;
}

export function categoryLessonCount(category: Category): number {
  return category.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
}

export function totalLessonCount(): number {
  return flattenLessons().length;
}

export function totalChapterCount(): number {
  return curriculum.reduce((total, category) => total + category.chapters.length, 0);
}

/** How many lessons in a chapter actually have material written. */
export function writtenLessonCount(chapter: Chapter): number {
  return chapter.lessons.filter((lesson) => lesson.status === 'written').length;
}

export function lessonKeysOf(chapter: Chapter, category: CategorySlug): LessonKey[] {
  return chapter.lessons.map((lesson) => lessonKey(category, chapter.slug, lesson.slug));
}

/** Route params for `generateStaticParams`. */
export function allLessonParams(): {
  category: string;
  chapter: string;
  lesson: string;
}[] {
  return flattenLessons().map((location) => ({
    category: location.category.slug,
    chapter: location.chapter.slug,
    lesson: location.lesson.slug,
  }));
}

export function allChapterParams(): { category: string; chapter: string }[] {
  return curriculum.flatMap((category) =>
    category.chapters.map((chapter) => ({
      category: category.slug,
      chapter: chapter.slug,
    })),
  );
}

export function allCategoryParams(): { category: string }[] {
  return curriculum.map((category) => ({ category: category.slug }));
}

/** The first lesson of the whole path — the suggested entry point for a new learner. */
export function firstLesson(): LessonLocation | undefined {
  return flattenLessons()[0];
}

/* ------------------------------------------------ navigation projection */

/**
 * Slim projections of the curriculum, for Client Components.
 *
 * This exists because of a real defect found in the 2026-08-02 audit: `SidebarNav` is a Client
 * Component, and calling `getCurriculum()` from it pulled the **entire** curriculum module into
 * the browser bundle — including every written lesson's prose and code blocks. Rendering a list
 * of links was costing readers the full text of every lesson on the site, and it would have
 * grown without bound as chapters were written.
 *
 * Module boundaries do not help here: a bundler cannot tree-shake unused *properties* of an
 * object it has to construct. The only fix is to never let the client import the data at all —
 * so a Server Component builds these projections and passes them down as props.
 *
 * Rule for anything added later: if a Client Component needs curriculum data, it takes it as a
 * prop. It must not import from this module.
 */

export type NavLesson = { slug: string; index: number; title: string };
export type NavChapter = {
  slug: string;
  number: number;
  title: string;
  lessons: NavLesson[];
};
export type NavCategory = {
  slug: CategorySlug;
  order: number;
  title: string;
  chapters: NavChapter[];
};

export function buildNavigationTree(): NavCategory[] {
  return curriculum.map((category) => ({
    slug: category.slug,
    order: category.order,
    title: category.title,
    chapters: category.chapters.map((chapter) => ({
      slug: chapter.slug,
      number: chapter.number,
      title: chapter.title,
      lessons: chapter.lessons.map((lesson) => ({
        slug: lesson.slug,
        index: lesson.index,
        title: lesson.title,
      })),
    })),
  }));
}

/** Flat list in learning order, without any lesson content. */
export type NavLessonRef = {
  key: LessonKey;
  number: string;
  title: string;
  minutes: number;
  categorySlug: CategorySlug;
  categoryTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
};

export function buildLessonIndex(): NavLessonRef[] {
  return flattenLessons().map((location) => ({
    key: location.key,
    number: location.number,
    title: location.lesson.title,
    minutes: location.lesson.minutes,
    categorySlug: location.category.slug,
    categoryTitle: location.category.title,
    chapterSlug: location.chapter.slug,
    chapterTitle: location.chapter.title,
    chapterNumber: location.chapter.number,
  }));
}
