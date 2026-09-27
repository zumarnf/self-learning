import type { Metadata } from 'next';
import { TamanBermainClient } from './taman-bermain-client';
import { getCurriculum } from '@/lib/curriculum/queries';
import { getExerciseSummaries } from '@/lib/taman-bermain/queries';
import type { ExerciseSummary } from '@/lib/taman-bermain/types';

export const metadata: Metadata = {
  title: 'Taman Bermain',
  description:
    'Soal coding yang dikerjakan langsung di halaman, dijalankan di browsermu, dan diperiksa otomatis.',
};

/** One row of the index — the summary plus the chapter title it came from. */
export type ExerciseRow = ExerciseSummary & { chapterTitle: string };

/**
 * Server wrapper.
 *
 * The client receives summaries only: no answer keys, no check specs, no alternative solutions.
 * Forty exercises' worth of that would be dead weight on a page that shows titles and badges, and
 * `client-bundle-boundary.test.ts` is what keeps the boundary from eroding (SDD §2.2).
 */
export default function TamanBermainPage() {
  const kurikulum = getCurriculum();

  const rows: ExerciseRow[] = getExerciseSummaries().map((exercise) => {
    const kategori = kurikulum.find((c) => c.slug === exercise.source.category);
    const bab = kategori?.chapters.find((c) => c.slug === exercise.source.chapter);
    return {
      ...exercise,
      chapterTitle:
        kategori && bab ? `${kategori.title} · Bab ${bab.number}` : 'Bab tidak ditemukan',
    };
  });

  return <TamanBermainClient rows={rows} />;
}
