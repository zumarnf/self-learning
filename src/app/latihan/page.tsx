import type { Metadata } from 'next';
import { LatihanClient } from './latihan-client';
import { getCurriculum } from '@/lib/curriculum/queries';
import { chapterKey } from '@/lib/curriculum/types';

export const metadata: Metadata = {
  title: 'Latihan',
  description: 'Seluruh kuis dan checklist praktik dari semua bab, dengan filter status.',
};

/** Only what the exercises page shows — no lesson content. */
export type LatihanEntry = {
  key: string;
  categoryTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  quizTotal: number;
  practiceItems: string[];
};

/** Server wrapper — keeps the curriculum out of the client bundle (audit 2026-08-02). */
export default function LatihanPage() {
  const chapters: LatihanEntry[] = getCurriculum().flatMap((category) =>
    category.chapters
      .filter((chapter) => chapter.quiz || chapter.practice)
      .map((chapter) => ({
        key: chapterKey(category.slug, chapter.slug),
        categoryTitle: category.title,
        chapterTitle: chapter.title,
        chapterNumber: chapter.number,
        quizTotal: chapter.quiz?.length ?? 0,
        practiceItems: chapter.practice?.items ?? [],
      })),
  );

  return <LatihanClient chapters={chapters} />;
}
