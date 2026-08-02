'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, RepeatIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/primitives';
import {
  setLastVisited,
  setLessonComplete,
  setNote,
  toggleNeedsReview,
  useLearningStore,
} from '@/lib/learning/store';
import { cn } from '@/lib/utils/cn';

/**
 * The interactive footer of a lesson: mark complete, flag for review, and take notes.
 *
 * Records the visit on mount so "Lanjutkan belajar" knows where the reader left off, and so the
 * activity chart reflects reading — not only completing.
 */
export function LessonActions({ lessonKey }: { lessonKey: string }) {
  const { data, hydrated, status } = useLearningStore();

  useEffect(() => {
    if (hydrated) setLastVisited(lessonKey);
  }, [hydrated, lessonKey]);

  const state = data.lessons[lessonKey];
  const isDone = state?.completedAt !== undefined;
  const needsReview = state?.needsReview === true;

  if (!hydrated) {
    return <Skeleton className="h-11 w-full max-w-md" />;
  }

  return (
    <div className="space-y-3">
      {status !== 'ok' ? <StorageWarning status={status} /> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={isDone ? 'secondary' : 'primary'}
          onClick={() => setLessonComplete(lessonKey, !isDone)}
        >
          <CheckIcon size={15} />
          {isDone ? 'Sudah selesai' : 'Tandai selesai'}
        </Button>

        <Button
          variant="ghost"
          onClick={() => toggleNeedsReview(lessonKey)}
          aria-pressed={needsReview}
          className={cn(needsReview && 'text-primary')}
        >
          <RepeatIcon size={15} />
          {needsReview ? 'Ditandai perlu diulang' : 'Perlu diulang'}
        </Button>
      </div>

      {/* Announce the change; a button whose label flips is not enough for assistive tech. */}
      <p aria-live="polite" className="sr-only">
        {isDone ? 'Sub-bab ditandai selesai.' : 'Sub-bab ditandai belum selesai.'}
      </p>
    </div>
  );
}

function StorageWarning({ status }: { status: string }) {
  const message =
    status === 'full'
      ? 'Penyimpanan browser penuh. Progres terbaru tidak tersimpan — ekspor datamu lalu bersihkan sebagian.'
      : status === 'unavailable'
        ? 'Browser ini memblokir penyimpanan lokal, jadi progres tidak akan tersimpan. Materi tetap bisa dibaca.'
        : 'Data tersimpan sebelumnya tidak bisa dibaca. Salinannya disimpan; kamu bisa memeriksanya di Pengaturan.';

  return (
    <p
      role="alert"
      className="border-border bg-warning-fill text-text rounded-md border px-3 py-2 text-xs"
    >
      {message}
    </p>
  );
}

const NOTE_SAVE_DELAY_MS = 600;

/**
 * Per-lesson notes.
 *
 * Stored and rendered as plain text only. Notes are never interpreted as HTML or Markdown —
 * that removes the one place where reader-authored content could become markup
 * (.claude/rules/security.md → never render untrusted HTML).
 */
export function NoteEditor({ lessonKey }: { lessonKey: string }) {
  const { data, hydrated } = useLearningStore();
  const stored = data.lessons[lessonKey]?.note ?? '';

  const [value, setValue] = useState(stored);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialised = useRef(false);

  // Adopt the stored note once hydration lands, without clobbering anything already typed.
  useEffect(() => {
    if (hydrated && !initialised.current) {
      initialised.current = true;
      setValue(stored);
    }
  }, [hydrated, stored]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function change(next: string) {
    setValue(next);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setNote(lessonKey, next);
      setSaved(true);
    }, NOTE_SAVE_DELAY_MS);
  }

  if (!hydrated) {
    return <Skeleton className="h-28 w-full" />;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={`note-${lessonKey}`}
          className="text-2xs text-faint font-medium tracking-[0.1em] uppercase"
        >
          Catatan saya
        </label>
        <span aria-live="polite" className="text-2xs text-faint">
          {saved ? 'Tersimpan' : value !== stored ? 'Mengetik…' : ''}
        </span>
      </div>

      <textarea
        id={`note-${lessonKey}`}
        value={value}
        onChange={(event) => change(event.target.value)}
        rows={4}
        placeholder="Tulis apa yang ingin kamu ingat dari sub-bab ini."
        className={cn(
          'border-border bg-surface mt-2 w-full resize-y rounded-md border px-3 py-2',
          'text-text placeholder:text-faint font-serif text-[0.98rem] leading-relaxed',
        )}
      />
    </div>
  );
}
