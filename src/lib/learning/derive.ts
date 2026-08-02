import type { Category } from '@/lib/curriculum/types';
import { chapterKey } from '@/lib/curriculum/types';
import type { LearningData, QuizState } from './schema';

/*
 * These functions take the *smallest shape they actually need* rather than the full curriculum
 * types. That is not academic tidiness: it lets a Client Component pass the slim navigation
 * projection (see `buildNavigationTree`) instead of importing the curriculum and dragging every
 * lesson's prose into the browser bundle. Structural typing means the full `Category` and
 * `Chapter` types still satisfy these, so server-side callers need no change.
 */

/** Anything with a slug and a list of lessons that have slugs. */
export type ProgressChapter = { slug: string; lessons: { slug: string }[] };
export type ProgressCategory = { slug: string; chapters: ProgressChapter[] };

/** A lesson reference carrying only what the UI displays — never its content. */
export type LessonRef = {
  key: string;
  number: string;
  title: string;
  categorySlug: string;
  categoryTitle: string;
  chapterSlug: string;
  chapterTitle: string;
};

/**
 * Everything computed from stored data.
 *
 * Pure functions with no storage access and no React — which is exactly what makes them testable
 * without jsdom, without mocks, and without a running browser
 * (.claude/rules/core.md → tests that actually run; engineering-judgment #7).
 */

export type ProgressCounts = { done: number; total: number; percent: number };

function counts(done: number, total: number): ProgressCounts {
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function isLessonDone(data: LearningData, key: string): boolean {
  return data.lessons[key]?.completedAt !== undefined;
}

export function chapterProgress(
  data: LearningData,
  category: ProgressCategory,
  chapter: ProgressChapter,
): ProgressCounts {
  let done = 0;
  for (const lesson of chapter.lessons) {
    if (isLessonDone(data, `${category.slug}/${chapter.slug}/${lesson.slug}`)) done += 1;
  }
  return counts(done, chapter.lessons.length);
}

export function categoryProgress(data: LearningData, category: ProgressCategory): ProgressCounts {
  let done = 0;
  let total = 0;
  for (const chapter of category.chapters) {
    const progress = chapterProgress(data, category, chapter);
    done += progress.done;
    total += progress.total;
  }
  return counts(done, total);
}

export function overallProgress(
  data: LearningData,
  categories: ProgressCategory[],
): ProgressCounts {
  let done = 0;
  let total = 0;
  for (const category of categories) {
    const progress = categoryProgress(data, category);
    done += progress.done;
    total += progress.total;
  }
  return counts(done, total);
}

/**
 * Where "Lanjutkan belajar" should go.
 *
 * Preference order: the last lesson opened if it is still unfinished, otherwise the first
 * unfinished lesson in learning order, otherwise nothing (the whole curriculum is done).
 */
export function resolveContinue<T extends { key: string }>(
  data: LearningData,
  lessons: T[],
): T | undefined {
  if (data.lastVisited) {
    const last = lessons.find((location) => location.key === data.lastVisited);
    if (last && !isLessonDone(data, last.key)) return last;
  }
  return lessons.find((location) => !isLessonDone(data, location.key));
}

export function collectReviewList<T extends { key: string }>(
  data: LearningData,
  lessons: T[],
): T[] {
  return lessons.filter((location) => data.lessons[location.key]?.needsReview === true);
}

export function collectNotes<T extends { key: string }>(
  data: LearningData,
  lessons: T[],
): { location: T; note: string; updatedAt?: string }[] {
  const result: { location: T; note: string; updatedAt?: string }[] = [];
  for (const location of lessons) {
    const note = data.lessons[location.key]?.note;
    if (note && note.trim().length > 0) {
      const updatedAt = data.lessons[location.key]?.noteUpdatedAt;
      result.push(updatedAt === undefined ? { location, note } : { location, note, updatedAt });
    }
  }
  return result;
}

export function getQuizState(
  data: LearningData,
  category: string,
  chapter: string,
): QuizState | undefined {
  return data.chapters[chapterKey(category as Category['slug'], chapter)]?.quiz;
}

/** Local calendar day, not UTC — a learner's streak follows the day they actually live in. */
export function toLocalDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDay(day: string, deltaDays: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const shifted = new Date(year ?? 1970, (month ?? 1) - 1, (date ?? 1) + deltaDays);
  return toLocalDay(shifted);
}

export type Streak = { current: number; longest: number };

/**
 * Streak over local calendar days.
 *
 * "Current" counts back from today, and tolerates today being empty as long as yesterday was
 * active — otherwise the streak would appear broken every morning before the first lesson.
 */
export function computeStreak(activity: Record<string, number>, today: Date): Streak {
  const days = Object.keys(activity)
    .filter((day) => (activity[day] ?? 0) > 0)
    .sort();

  if (days.length === 0) return { current: 0, longest: 0 };

  const active = new Set(days);
  const todayKey = toLocalDay(today);

  let cursor = active.has(todayKey) ? todayKey : shiftDay(todayKey, -1);
  let current = 0;
  while (active.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous: string | undefined;
  for (const day of days) {
    run = previous !== undefined && shiftDay(previous, 1) === day ? run + 1 : 1;
    if (run > longest) longest = run;
    previous = day;
  }

  return { current, longest };
}

/** Activity counts for the last `days` calendar days, oldest first. */
export function recentActivity(
  activity: Record<string, number>,
  today: Date,
  days = 30,
): { day: string; count: number }[] {
  const todayKey = toLocalDay(today);
  const result: { day: string; count: number }[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = shiftDay(todayKey, -offset);
    result.push({ day, count: activity[day] ?? 0 });
  }
  return result;
}

export type QuizResult = {
  score: number;
  total: number;
  perQuestion: { id: string; chosen: number; correct: number; isCorrect: boolean }[];
};

export function scoreQuiz(
  questions: { id: string; answerIndex: number }[],
  answers: Record<string, number>,
): QuizResult {
  const perQuestion = questions.map((question) => {
    const chosen = answers[question.id] ?? -1;
    return {
      id: question.id,
      chosen,
      correct: question.answerIndex,
      isCorrect: chosen === question.answerIndex,
    };
  });

  return {
    score: perQuestion.filter((entry) => entry.isCorrect).length,
    total: questions.length,
    perQuestion,
  };
}

/**
 * Stored lesson keys that no longer exist in the curriculum.
 *
 * These are kept rather than deleted: a lesson may have been renamed and could come back, and
 * silently discarding a learner's history is not a decision this app makes on its own. They are
 * shown in Settings so the learner can clear them deliberately.
 */
export function findOrphanedKeys(data: LearningData, validKeys: Set<string>): string[] {
  return Object.keys(data.lessons).filter((key) => !validKeys.has(key));
}
