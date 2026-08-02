'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { SearchIcon } from '@/components/ui/icons';
import { Card, EmptyState, Eyebrow, Skeleton } from '@/components/ui/primitives';
import type { NavLessonRef } from '@/lib/curriculum/queries';
import { collectNotes } from '@/lib/learning/derive';
import { useLearningStore } from '@/lib/learning/store';
import { formatDateTime } from '@/lib/utils/format';

/**
 * All personal notes in one place, with a link back to the lesson each belongs to.
 *
 * Notes are rendered as plain text — `whitespace-pre-wrap` preserves the line breaks the reader
 * typed without ever interpreting their input as markup (NFR-S3).
 */
export function CatatanClient({ lessons }: { lessons: NavLessonRef[] }) {
  const { data, hydrated } = useLearningStore();
  const [query, setQuery] = useState('');

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-6 h-10 w-full" />
        <Skeleton className="mt-6 h-64" />
      </div>
    );
  }

  const notes = collectNotes(data, lessons);
  const normalised = query.trim().toLowerCase();
  const visible =
    normalised.length === 0
      ? notes
      : notes.filter(
          (entry) =>
            entry.note.toLowerCase().includes(normalised) ||
            entry.location.title.toLowerCase().includes(normalised),
        );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Milikmu sendiri</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Catatan
        </h1>
        <p className="tabular text-muted mt-3">
          {notes.length === 0
            ? 'Belum ada catatan.'
            : `${notes.length} catatan dari ${notes.length} sub-bab.`}
        </p>
      </header>

      {notes.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Belum ada catatan"
          description="Setiap halaman sub-bab punya kotak catatan di bawah materinya. Apa yang kamu tulis di sana akan muncul di halaman ini, lengkap dengan tautan kembali ke sumbernya."
          action={<ButtonLink href="/kelas">Buka daftar kelas</ButtonLink>}
        />
      ) : (
        <>
          <div className="relative mt-8">
            <SearchIcon
              size={15}
              className="text-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <label htmlFor="cari-catatan" className="sr-only">
              Cari catatan
            </label>
            <input
              id="cari-catatan"
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari isi catatan atau judul sub-bab…"
              className="border-border bg-surface text-text placeholder:text-faint w-full rounded-md border py-2 pr-3 pl-9 text-sm"
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              className="mt-6"
              title={`Tidak ada catatan yang cocok dengan "${query.trim()}"`}
              description="Coba kata kunci yang lebih pendek, atau kosongkan kotak pencarian untuk melihat semuanya."
            />
          ) : (
            <ul className="mt-6 space-y-3">
              {visible.map((entry) => (
                <li key={entry.location.key}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link
                        href={`/kelas/${entry.location.key}`}
                        className="text-text hover:text-primary font-sans text-sm font-medium"
                      >
                        <span className="tabular text-faint mr-2">{entry.location.number}</span>
                        {entry.location.title}
                      </Link>
                      {entry.updatedAt ? (
                        <span className="tabular text-2xs text-faint">
                          {formatDateTime(entry.updatedAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-faint mt-1 text-xs">
                      {entry.location.categoryTitle} · {entry.location.chapterTitle}
                    </p>
                    <p className="text-text mt-3 font-serif text-[0.98rem] leading-relaxed whitespace-pre-wrap">
                      {entry.note}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
