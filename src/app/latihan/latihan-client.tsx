'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Card, Eyebrow, EmptyState, Skeleton } from '@/components/ui/primitives';
import { ButtonLink } from '@/components/ui/button';
import { useLearningStore } from '@/lib/learning/store';
import type { LatihanEntry } from './page';
import { cn } from '@/lib/utils/cn';

type Filter = 'semua' | 'belum' | 'sedang' | 'selesai';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'belum', label: 'Belum dikerjakan' },
  { value: 'sedang', label: 'Sedang berjalan' },
  { value: 'selesai', label: 'Selesai' },
];

/**
 * Every quiz and practice checklist in one place, filterable by status.
 *
 * "Selesai" for a quiz means a perfect score, not merely an attempt — a 4/8 that counts as done
 * would quietly defeat the purpose of having the quiz.
 */
export function LatihanClient({ chapters }: { chapters: LatihanEntry[] }) {
  const { data, hydrated } = useLearningStore();
  const [filter, setFilter] = useState<Filter>('semua');

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-6 h-10 w-full max-w-md" />
        <Skeleton className="mt-6 h-96" />
      </div>
    );
  }

  const entries = chapters.map((entry) => {
    const state = data.chapters[entry.key];
    const quizBest = state?.quiz?.bestScore ?? 0;
    const quizAttempts = state?.quiz?.attempts ?? 0;
    const practiceDone = entry.practiceItems.filter((_, i) => state?.practice?.[String(i)]).length;

    const totalDone = quizBest + practiceDone;
    const totalItems = entry.quizTotal + entry.practiceItems.length;

    const status: Filter =
      totalDone === 0 ? 'belum' : totalDone === totalItems ? 'selesai' : 'sedang';

    return {
      ...entry,
      quizBest,
      quizAttempts,
      practiceDone,
      practiceTotal: entry.practiceItems.length,
      status,
    };
  });

  const visible = filter === 'semua' ? entries : entries.filter((entry) => entry.status === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Uji pemahaman</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Latihan
        </h1>
        <p className="tabular text-muted mt-3 max-w-prose">
          {entries.length} bab punya kuis atau checklist praktik. Kerjakan setelah membaca babnya,
          bukan sebelum.
        </p>
      </header>

      <div
        className="mt-8 flex flex-wrap gap-1"
        role="group"
        aria-label="Saring berdasarkan status"
      >
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={cn(
              'duration-fast rounded-md border px-3 py-1.5 text-xs transition-colors',
              filter === option.value
                ? 'border-border-strong bg-raised text-text font-medium'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Tidak ada yang cocok dengan saringan ini"
          description={
            filter === 'selesai'
              ? 'Belum ada bab yang kuis dan checklistnya tuntas. Selesaikan satu bab dulu, lalu kembali ke sini.'
              : 'Coba ganti saringannya, atau mulai dari bab pertama.'
          }
          action={<ButtonLink href="/kelas">Buka daftar kelas</ButtonLink>}
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((entry) => (
            <li key={entry.key}>
              <Card className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-faint text-xs">{entry.categoryTitle}</p>
                    <Link
                      href={`/kelas/${entry.key}`}
                      className="text-text hover:text-primary font-sans text-base font-medium"
                    >
                      Bab {entry.chapterNumber} · {entry.chapterTitle}
                    </Link>
                  </div>
                  {entry.status === 'selesai' ? (
                    <Badge tone="accent">Selesai</Badge>
                  ) : entry.status === 'sedang' ? (
                    <Badge tone="warning">Sedang berjalan</Badge>
                  ) : (
                    <Badge tone="neutral">Belum dikerjakan</Badge>
                  )}
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {entry.quizTotal > 0 ? (
                    <div className="border-border rounded-md border px-3 py-2">
                      <dt className="text-2xs text-faint tracking-[0.08em] uppercase">Kuis</dt>
                      <dd className="tabular text-text mt-1 text-sm">
                        {entry.quizAttempts === 0
                          ? `${entry.quizTotal} soal · belum dikerjakan`
                          : `Skor terbaik ${entry.quizBest}/${entry.quizTotal} · ${entry.quizAttempts}× percobaan`}
                      </dd>
                    </div>
                  ) : null}

                  {entry.practiceTotal > 0 ? (
                    <div className="border-border rounded-md border px-3 py-2">
                      <dt className="text-2xs text-faint tracking-[0.08em] uppercase">Praktik</dt>
                      <dd className="tabular text-text mt-1 text-sm">
                        {entry.practiceDone}/{entry.practiceTotal} item dicentang
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
