'use client';

import { useSyncExternalStore } from 'react';
import { toLocalDay } from './derive';
import { EMPTY_SNAPSHOT, SCHEMA_VERSION, type LearningData, type ThemePreference } from './schema';
import { clear as clearStorage, load, save, type StorageStatus } from './storage';

/**
 * The learning store.
 *
 * A plain external store read through `useSyncExternalStore` rather than a state library:
 * the data is a single small object with a handful of actions, it must survive being read from
 * many unrelated components, and it has to behave correctly under React 19's concurrent
 * rendering. `useSyncExternalStore` is the primitive built for exactly that (SDD §5.2).
 *
 * The server snapshot is always empty. Progress lives only in the browser, so rendering it on
 * the server would be a hydration mismatch by construction — components show a skeleton until
 * `hydrated` turns true instead of guessing.
 */

export type StoreSnapshot = {
  data: LearningData;
  hydrated: boolean;
  status: StorageStatus;
  /** Present when stored data could not be read and a backup was kept. */
  recoveredFrom?: string;
};

const SERVER_SNAPSHOT: StoreSnapshot = Object.freeze({
  data: EMPTY_SNAPSHOT,
  hydrated: false,
  status: 'ok' as StorageStatus,
});

let snapshot: StoreSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

/** Writes are debounced: typing a note must not hit storage on every keystroke. */
const SAVE_DELAY_MS = 300;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function emit(): void {
  for (const listener of listeners) listener();
}

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const status = save(snapshot.data);
    if (status !== snapshot.status) {
      snapshot = { ...snapshot, status };
      emit();
    }
  }, SAVE_DELAY_MS);
}

/** Apply a change to the data, bump `updatedAt`, notify, and schedule a write. */
function update(mutate: (draft: LearningData) => LearningData): void {
  const next = mutate(snapshot.data);
  snapshot = { ...snapshot, data: { ...next, updatedAt: new Date().toISOString() } };
  emit();
  scheduleSave();
}

/** Any meaningful interaction counts toward the day's activity, and therefore the streak. */
function withActivity(data: LearningData): LearningData {
  const day = toLocalDay(new Date());
  return { ...data, activity: { ...data.activity, [day]: (data.activity[day] ?? 0) + 1 } };
}

function hydrate(): void {
  if (snapshot.hydrated) return;
  const result = load();
  snapshot = {
    data: result.data,
    hydrated: true,
    status: result.status,
    ...(result.recoveredFrom === undefined ? {} : { recoveredFrom: result.recoveredFrom }),
  };
  emit();
}

function subscribe(listener: () => void): () => void {
  // The first subscriber triggers hydration, so nothing touches storage during render.
  if (!snapshot.hydrated) hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoreSnapshot {
  return snapshot;
}

function getServerSnapshot(): StoreSnapshot {
  return SERVER_SNAPSHOT;
}

export function useLearningStore(): StoreSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------------------------------------------ actions */

export function setLessonComplete(key: string, complete: boolean): void {
  update((data) => {
    const lessons = { ...data.lessons };
    const existing = lessons[key] ?? {};

    if (complete) {
      lessons[key] = { ...existing, completedAt: new Date().toISOString() };
    } else {
      const { completedAt: _removed, ...rest } = existing;
      lessons[key] = rest;
    }

    return withActivity({ ...data, lessons });
  });
}

export function toggleNeedsReview(key: string): void {
  update((data) => {
    const lessons = { ...data.lessons };
    const existing = lessons[key] ?? {};
    if (existing.needsReview) {
      const { needsReview: _removed, ...rest } = existing;
      lessons[key] = rest;
    } else {
      lessons[key] = { ...existing, needsReview: true };
    }
    return { ...data, lessons };
  });
}

export function setNote(key: string, note: string): void {
  update((data) => {
    const lessons = { ...data.lessons };
    const existing = lessons[key] ?? {};

    if (note.trim().length === 0) {
      const { note: _n, noteUpdatedAt: _u, ...rest } = existing;
      lessons[key] = rest;
    } else {
      lessons[key] = { ...existing, note, noteUpdatedAt: new Date().toISOString() };
    }

    return { ...data, lessons };
  });
}

export function setLastVisited(key: string): void {
  // Reading a lesson counts as activity, but only the first time in a given day per lesson —
  // otherwise re-reading one page would inflate the activity chart.
  if (snapshot.data.lastVisited === key) return;
  update((data) => withActivity({ ...data, lastVisited: key }));
}

export function recordQuizAttempt(chapter: string, score: number, total: number): void {
  update((data) => {
    const chapters = { ...data.chapters };
    const existing = chapters[chapter] ?? {};
    const previous = existing.quiz;

    chapters[chapter] = {
      ...existing,
      quiz: {
        bestScore: Math.max(previous?.bestScore ?? 0, score),
        total,
        attempts: (previous?.attempts ?? 0) + 1,
        lastAttemptAt: new Date().toISOString(),
      },
    };

    return withActivity({ ...data, chapters });
  });
}

export function togglePracticeItem(chapter: string, itemIndex: number): void {
  update((data) => {
    const chapters = { ...data.chapters };
    const existing = chapters[chapter] ?? {};
    const practice = { ...(existing.practice ?? {}) };
    const key = String(itemIndex);

    if (practice[key]) {
      delete practice[key];
    } else {
      practice[key] = true;
    }

    chapters[chapter] = { ...existing, practice };
    return { ...data, chapters };
  });
}

export function setTheme(theme: ThemePreference): void {
  update((data) => ({ ...data, preferences: { ...data.preferences, theme } }));
}

/** Replace everything — used by import. Deliberately a replace, not a merge (SDD §5.3). */
export function replaceAll(data: LearningData): void {
  update(() => ({ ...data, schemaVersion: SCHEMA_VERSION }));
}

export function resetAll(): void {
  clearStorage();
  update(() => ({
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    lessons: {},
    chapters: {},
    activity: {},
    lastVisited: null,
    // Theme is a display preference, not progress — resetting progress must not flip the theme.
    preferences: { ...snapshot.data.preferences },
  }));
}

export function dropOrphanedKeys(keys: string[]): void {
  update((data) => {
    const lessons = { ...data.lessons };
    for (const key of keys) delete lessons[key];
    return { ...data, lessons };
  });
}

/* -------------------------------------------------------------- test support */

/** Reset module state between tests. Not used by the app. */
export function __resetStoreForTests(): void {
  if (saveTimer) clearTimeout(saveTimer);
  snapshot = SERVER_SNAPSHOT;
  listeners.clear();
}
