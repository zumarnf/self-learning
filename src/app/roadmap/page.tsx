import type { Metadata } from 'next';
import { RoadmapClient } from './roadmap-client';
import { stripInline } from '@/lib/content/parse-inline';
import {
  categoryLessonCount,
  categoryMinutes,
  getCurriculum,
  type NavChapter,
} from '@/lib/curriculum/queries';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Lima tahap berurutan dari JavaScript dari nol sampai deploy ke produksi.',
};

/** Everything the roadmap displays — deliberately without any lesson content. */
export type RoadmapCategory = {
  slug: string;
  order: number;
  title: string;
  lessonCount: number;
  minutes: number;
  chapterTitles: string[];
  chapters: Pick<NavChapter, 'slug' | 'lessons'>[];
};

/** Server wrapper — keeps the curriculum out of the client bundle (audit 2026-08-02). */
export default function RoadmapPage() {
  const categories: RoadmapCategory[] = getCurriculum().map((category) => ({
    slug: category.slug,
    order: category.order,
    title: category.title,
    lessonCount: categoryLessonCount(category),
    minutes: categoryMinutes(category),
    chapterTitles: category.chapters.map((chapter) => chapter.title),
    chapters: category.chapters.map((chapter) => ({
      slug: chapter.slug,
      lessons: chapter.lessons.map((lesson) => ({
        slug: lesson.slug,
        index: lesson.index,
        title: stripInline(lesson.title),
      })),
    })),
  }));

  return <RoadmapClient categories={categories} />;
}
