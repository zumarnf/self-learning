/**
 * Shape of everything this app remembers about the learner, plus the validation that guards it.
 *
 * All of it lives in `localStorage` on one device (ADR-0002). It is small, private, and never
 * leaves the machine — but it is still parsed as untrusted input, because a stored value can be
 * edited by hand, corrupted, or come from an import file
 * (.claude/rules/security.md → validate everything crossing a trust boundary).
 */

export const STORAGE_KEY = 'rbf.learning-data';
export const BACKUP_KEY = 'rbf.learning-data.corrupt-backup';
export const SCHEMA_VERSION = 2;

/** Guard against a pathological import; real data is a few tens of kilobytes. */
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

/**
 * Cap on a saved Taman Bermain draft.
 *
 * This is the only field in the schema whose length the learner controls, and therefore the only
 * one that can fill `localStorage` by itself. Forty exercises at this cap is roughly 800 KB,
 * comfortably inside a 5 MB budget (`security.md` — enforce limits).
 */
export const MAX_DRAFT_CHARS = 20_000;

export type ThemePreference = 'system' | 'light' | 'dark';

export type LessonState = {
  completedAt?: string;
  needsReview?: boolean;
  note?: string;
  noteUpdatedAt?: string;
};

export type QuizState = {
  bestScore: number;
  total: number;
  attempts: number;
  lastAttemptAt: string;
};

/** One Taman Bermain exercise, keyed by its slug. Untouched exercises have no entry at all. */
export type ExerciseState = {
  /** 'benar' means every rule and every scenario passed. It is never downgraded afterwards. */
  status: 'dicoba' | 'benar';
  attempts: number;
  solvedAt?: string;
  /** Last draft, so a reload never costs the learner what they typed. Truncated on read. */
  code?: string;
  /** Whether the answer key was opened. Recorded plainly; it does not undo 'benar'. */
  revealed?: boolean;
};

export type ChapterState = {
  quiz?: QuizState;
  /** Checklist item index → checked. Sparse: unchecked items are simply absent. */
  practice?: Record<string, boolean>;
};

export type LearningData = {
  schemaVersion: number;
  updatedAt: string;
  /** Keyed by `category/chapter/lesson`. Untouched lessons have no entry at all. */
  lessons: Record<string, LessonState>;
  /** Keyed by `category/chapter`. */
  chapters: Record<string, ChapterState>;
  /** Keyed by exercise slug (schema 2). */
  exercises: Record<string, ExerciseState>;
  /** `YYYY-MM-DD` (local date) → number of activities that day. */
  activity: Record<string, number>;
  lastVisited: string | null;
  preferences: { theme: ThemePreference };
};

export function emptyData(): LearningData {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    lessons: {},
    chapters: {},
    exercises: {},
    activity: {},
    lastVisited: null,
    preferences: { theme: 'system' },
  };
}

/** A single, immutable empty snapshot for server rendering — see `store.ts` for why. */
export const EMPTY_SNAPSHOT: LearningData = Object.freeze({
  schemaVersion: SCHEMA_VERSION,
  updatedAt: '1970-01-01T00:00:00.000Z',
  lessons: Object.freeze({}) as Record<string, LessonState>,
  chapters: Object.freeze({}) as Record<string, ChapterState>,
  exercises: Object.freeze({}) as Record<string, ExerciseState>,
  activity: Object.freeze({}) as Record<string, number>,
  lastVisited: null,
  preferences: Object.freeze({ theme: 'system' as ThemePreference }),
});

export type ParseResult = { ok: true; data: LearningData } | { ok: false; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTheme(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function parseLessonState(value: unknown): LessonState | undefined {
  if (!isRecord(value)) return undefined;
  const state: LessonState = {};
  if (typeof value.completedAt === 'string') state.completedAt = value.completedAt;
  if (value.needsReview === true) state.needsReview = true;
  if (typeof value.note === 'string') state.note = value.note;
  if (typeof value.noteUpdatedAt === 'string') state.noteUpdatedAt = value.noteUpdatedAt;
  return state;
}

function parseChapterState(value: unknown): ChapterState | undefined {
  if (!isRecord(value)) return undefined;
  const state: ChapterState = {};

  if (isRecord(value.quiz)) {
    const { bestScore, total, attempts, lastAttemptAt } = value.quiz;
    if (
      typeof bestScore === 'number' &&
      typeof total === 'number' &&
      typeof attempts === 'number' &&
      typeof lastAttemptAt === 'string'
    ) {
      state.quiz = { bestScore, total, attempts, lastAttemptAt };
    }
  }

  if (isRecord(value.practice)) {
    const practice: Record<string, boolean> = {};
    for (const [key, checked] of Object.entries(value.practice)) {
      if (checked === true) practice[key] = true;
    }
    state.practice = practice;
  }

  return state;
}

function parseExerciseState(value: unknown): ExerciseState | undefined {
  if (!isRecord(value)) return undefined;

  // Status is the one field with no safe fallback: an entry whose status cannot be read tells us
  // nothing about whether the exercise was solved, so the entry is dropped rather than guessed.
  if (value.status !== 'dicoba' && value.status !== 'benar') return undefined;

  const attempts =
    typeof value.attempts === 'number' && Number.isFinite(value.attempts)
      ? Math.max(0, Math.floor(value.attempts))
      : 0;

  const state: ExerciseState = { status: value.status, attempts };
  if (typeof value.solvedAt === 'string') state.solvedAt = value.solvedAt;
  // Truncate rather than reject: one oversized draft must not cost the learner every other
  // exercise they have solved.
  if (typeof value.code === 'string') state.code = value.code.slice(0, MAX_DRAFT_CHARS);
  if (value.revealed === true) state.revealed = true;

  return state;
}

/**
 * Parse stored or imported JSON into `LearningData`.
 *
 * Unknown fields are dropped rather than carried through, and a malformed sub-object is skipped
 * rather than failing the whole file — one corrupt lesson entry should not cost the learner
 * every other lesson's progress. A wrong *shape* at the top level is still a hard rejection.
 */
export function parseLearningData(raw: unknown): ParseResult {
  if (!isRecord(raw)) {
    return { ok: false, reason: 'Isi berkas bukan objek JSON.' };
  }

  if (typeof raw.schemaVersion !== 'number') {
    return { ok: false, reason: 'Field "schemaVersion" tidak ada atau bukan angka.' };
  }

  if (raw.schemaVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `Berkas ini dibuat versi aplikasi yang lebih baru (skema ${raw.schemaVersion}, aplikasi ini mengerti sampai ${SCHEMA_VERSION}).`,
    };
  }

  const data = emptyData();

  if (isRecord(raw.lessons)) {
    for (const [key, value] of Object.entries(raw.lessons)) {
      const state = parseLessonState(value);
      if (state) data.lessons[key] = state;
    }
  }

  if (isRecord(raw.chapters)) {
    for (const [key, value] of Object.entries(raw.chapters)) {
      const state = parseChapterState(value);
      if (state) data.chapters[key] = state;
    }
  }

  if (isRecord(raw.exercises)) {
    for (const [key, value] of Object.entries(raw.exercises)) {
      const state = parseExerciseState(value);
      if (state) data.exercises[key] = state;
    }
  }

  if (isRecord(raw.activity)) {
    for (const [day, count] of Object.entries(raw.activity)) {
      if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
        data.activity[day] = Math.floor(count);
      }
    }
  }

  if (typeof raw.lastVisited === 'string') data.lastVisited = raw.lastVisited;

  if (isRecord(raw.preferences) && isTheme(raw.preferences.theme)) {
    data.preferences.theme = raw.preferences.theme;
  }

  if (typeof raw.updatedAt === 'string') data.updatedAt = raw.updatedAt;

  // Migration point.
  //
  // v1 -> v2 added `exercises` and nothing else, so the transform is the absence of one: a v1
  // file simply has no `exercises` key, and `emptyData()` already supplied an empty map above.
  // Purely additive, which is why an old export still imports without losing anything.
  //
  // A v3 transform belongs here too, rather than in a scattered set of defensive reads.
  data.schemaVersion = SCHEMA_VERSION;

  return { ok: true, data };
}

/** Parse a JSON string, rejecting oversized input before it is even parsed. */
export function parseImportFile(text: string): ParseResult {
  if (text.length > MAX_IMPORT_BYTES) {
    return { ok: false, reason: 'Berkas terlalu besar (maksimum 5 MB).' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'Berkas bukan JSON yang valid.' };
  }

  return parseLearningData(raw);
}
