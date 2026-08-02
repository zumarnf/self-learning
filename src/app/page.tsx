import { DashboardClient } from './dashboard-client';
import { stripInline } from '@/lib/content/parse-inline';
import {
  buildLessonIndex,
  categoryLessonCount,
  getCurriculum,
  totalChapterCount,
  totalLessonCount,
  type NavChapter,
  type NavLessonRef,
} from '@/lib/curriculum/queries';

/** Category summary for the dashboard — slugs and counts only, never lesson content. */
export type DashboardCategory = {
  slug: string;
  order: number;
  title: string;
  lessonCount: number;
  chapters: Pick<NavChapter, 'slug' | 'lessons'>[];
};

export type DashboardData = {
  curriculum: DashboardCategory[];
  lessons: NavLessonRef[];
  totals: { categories: number; chapters: number; lessons: number };
  start: NavLessonRef | undefined;
};

/**
 * Server wrapper for the dashboard.
 *
 * Builds every projection the client needs here, so the curriculum module — and with it every
 * lesson's prose and code — never reaches the browser. This split was the fix for the bundle
 * leak found in the 2026-08-02 audit; see `buildNavigationTree` in queries.ts for the full note.
 */
export default function DashboardPage() {
  const curriculum: DashboardCategory[] = getCurriculum().map((category) => ({
    slug: category.slug,
    order: category.order,
    title: category.title,
    lessonCount: categoryLessonCount(category),
    chapters: category.chapters.map((chapter) => ({
      slug: chapter.slug,
      lessons: chapter.lessons.map((lesson) => ({
        slug: lesson.slug,
        index: lesson.index,
        title: stripInline(lesson.title),
      })),
    })),
  }));

  const lessons = buildLessonIndex();

  return (
    <DashboardClient
      curriculum={curriculum}
      lessons={lessons}
      totals={{
        categories: curriculum.length,
        chapters: totalChapterCount(),
        lessons: totalLessonCount(),
      }}
      start={lessons[0]}
    />
  );
}
