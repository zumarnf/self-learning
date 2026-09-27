'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState, Eyebrow, Skeleton } from '@/components/ui/primitives';
import { ExerciseCard, type CardStatus } from '@/components/taman-bermain/exercise-card';
import { FilterGroup } from '@/components/taman-bermain/filter-group';
import { useLearningStore } from '@/lib/learning/store';
import type { ExerciseRow } from './page';

type LevelFilter = 'semua' | 'basic' | 'intermediate';
type StatusFilter = 'semua' | CardStatus;

/**
 * The exercise index.
 *
 * Three filters rather than one, because the three questions a reader actually arrives with are
 * different: what am I studying, how hard, and what have I not finished. Combining them into one
 * control would force a choice between them.
 */
export function TamanBermainClient({ rows }: { rows: ExerciseRow[] }) {
  const { data, hydrated } = useLearningStore();
  const [topik, setTopik] = useState<string>('semua');
  const [level, setLevel] = useState<LevelFilter>('semua');
  const [status, setStatus] = useState<StatusFilter>('semua');

  const topikOptions = useMemo(() => {
    const unik: string[] = [];
    for (const row of rows) if (!unik.includes(row.topic)) unik.push(row.topic);
    return [
      { value: 'semua', label: 'Semua' },
      ...unik.map((t) => ({ value: t, label: t.replace(/-/g, ' ') })),
    ];
  }, [rows]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-6 h-24 w-full" />
        <Skeleton className="mt-6 h-96" />
      </div>
    );
  }

  const entries = rows.map((row) => {
    const state = data.exercises[row.slug];
    const cardStatus: CardStatus =
      state === undefined ? 'belum' : state.status === 'benar' ? 'benar' : 'dicoba';
    return { ...row, cardStatus, attempts: state?.attempts ?? 0 };
  });

  const visible = entries.filter(
    (entry) =>
      (topik === 'semua' || entry.topic === topik) &&
      (level === 'semua' || entry.level === level) &&
      (status === 'semua' || entry.cardStatus === status),
  );

  const benar = entries.filter((entry) => entry.cardStatus === 'benar').length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Latihan menulis kode</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Taman Bermain
        </h1>
        <p className="text-muted mt-3 max-w-prose">
          Soal diambil dari materi yang sudah kamu baca. Kodenya dijalankan di browsermu sendiri dan
          diperiksa otomatis. Tidak ada yang dikirim ke mana pun.
        </p>
        <p className="tabular text-faint mt-4 text-xs">
          {benar} dari {entries.length} soal sudah benar.
        </p>
      </header>

      <div className="mt-8 space-y-2">
        <FilterGroup label="Topik" options={topikOptions} value={topik} onChange={setTopik} />
        <FilterGroup
          label="Tingkat"
          options={[
            { value: 'semua', label: 'Semua' },
            { value: 'basic', label: 'Basic' },
            { value: 'intermediate', label: 'Intermediate' },
          ]}
          value={level}
          onChange={setLevel}
        />
        <FilterGroup
          label="Status"
          options={[
            { value: 'semua', label: 'Semua' },
            { value: 'belum', label: 'Belum' },
            { value: 'dicoba', label: 'Pernah dicoba' },
            { value: 'benar', label: 'Benar' },
          ]}
          value={status}
          onChange={setStatus}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Tidak ada soal yang cocok dengan saringan ini"
          description={
            status === 'benar'
              ? 'Belum ada soal yang selesai dengan saringan ini. Coba kerjakan satu dulu.'
              : 'Coba longgarkan salah satu saringannya.'
          }
          action={
            // Mengosongkan saringan, bukan menavigasi — halamannya memang sudah di sini.
            <Button
              onClick={() => {
                setTopik('semua');
                setLevel('semua');
                setStatus('semua');
              }}
            >
              Tampilkan semua soal
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((entry) => (
            <li key={entry.slug}>
              <ExerciseCard
                exercise={entry}
                status={entry.cardStatus}
                attempts={entry.attempts}
                chapterTitle={entry.chapterTitle}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
