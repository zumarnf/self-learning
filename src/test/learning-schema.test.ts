import { describe, expect, it } from 'vitest';
import {
  MAX_DRAFT_CHARS,
  MAX_IMPORT_BYTES,
  SCHEMA_VERSION,
  emptyData,
  parseImportFile,
  parseLearningData,
} from '@/lib/learning/schema';

/**
 * Import and storage parsing.
 *
 * Stored data is treated as untrusted input even though it never leaves the device: it can be
 * hand-edited, truncated, or come from a file someone else produced. The failure requirement is
 * strict — a bad import must not damage what the learner already has (FR-3.8).
 */

describe('parseLearningData — bentuk yang salah', () => {
  it('menolak nilai yang bukan objek', () => {
    for (const value of [null, undefined, 42, 'teks', [], true]) {
      expect(parseLearningData(value).ok, `nilai: ${JSON.stringify(value)}`).toBe(false);
    }
  });

  it('menolak objek tanpa schemaVersion', () => {
    const result = parseLearningData({ lessons: {} });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('schemaVersion');
  });

  it('menolak skema dari versi aplikasi yang lebih baru', () => {
    const result = parseLearningData({ schemaVersion: SCHEMA_VERSION + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('lebih baru');
  });
});

describe('parseLearningData — data yang cacat sebagian', () => {
  it('membuang entri sub-bab yang bukan objek, tanpa menggagalkan sisanya', () => {
    const result = parseLearningData({
      schemaVersion: 1,
      lessons: {
        'a/b/c': { completedAt: '2026-08-01T00:00:00.000Z' },
        'd/e/f': 'bukan objek',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.lessons['a/b/c']?.completedAt).toBe('2026-08-01T00:00:00.000Z');
      expect(result.data.lessons['d/e/f']).toBeUndefined();
    }
  });

  it('membuang field yang tipenya salah, bukan menerimanya apa adanya', () => {
    const result = parseLearningData({
      schemaVersion: 1,
      lessons: { 'a/b/c': { completedAt: 12345, needsReview: 'ya', note: null } },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const state = result.data.lessons['a/b/c'];
      expect(state?.completedAt).toBeUndefined();
      expect(state?.needsReview).toBeUndefined();
      expect(state?.note).toBeUndefined();
    }
  });

  it('mengabaikan hitungan aktivitas yang negatif atau bukan angka', () => {
    const result = parseLearningData({
      schemaVersion: 1,
      activity: { '2026-08-01': 3, '2026-08-02': -1, '2026-08-03': 'banyak' },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.activity).toEqual({ '2026-08-01': 3 });
    }
  });

  it('mengabaikan preferensi tema yang tidak dikenal', () => {
    const result = parseLearningData({
      schemaVersion: 1,
      preferences: { theme: 'neon' },
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.preferences.theme).toBe('system');
  });

  it('membuang field tak dikenal alih-alih meneruskannya', () => {
    const result = parseLearningData({ schemaVersion: 1, tidakDikenal: { a: 1 } });
    expect(result.ok).toBe(true);
    if (result.ok) expect('tidakDikenal' in result.data).toBe(false);
  });
});

describe('parseImportFile', () => {
  it('menolak JSON yang tidak valid', () => {
    const result = parseImportFile('{ ini bukan json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('JSON');
  });

  it('menolak berkas yang melebihi batas ukuran', () => {
    const result = parseImportFile('x'.repeat(MAX_IMPORT_BYTES + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('terlalu besar');
  });

  it('menerima hasil ekspor yang sah', () => {
    const exported = JSON.stringify({ ...emptyData(), exportedAt: '2026-08-01T00:00:00.000Z' });
    expect(parseImportFile(exported).ok).toBe(true);
  });
});

describe('round-trip ekspor → impor', () => {
  it('mempertahankan seluruh informasi tanpa kehilangan', () => {
    const original = {
      ...emptyData(),
      lessons: {
        'frontend-basic/javascript-dari-nol/apa-itu-javascript': {
          completedAt: '2026-08-01T09:00:00.000Z',
          needsReview: true,
          note: 'runtime menentukan API yang tersedia',
          noteUpdatedAt: '2026-08-01T09:05:00.000Z',
        },
      },
      chapters: {
        'frontend-basic/javascript-dari-nol': {
          quiz: {
            bestScore: 5,
            total: 6,
            attempts: 2,
            lastAttemptAt: '2026-08-01T09:10:00.000Z',
          },
          practice: { '0': true, '2': true },
        },
      },
      activity: { '2026-08-01': 4 },
      lastVisited: 'frontend-basic/javascript-dari-nol/tipe-data',
      preferences: { theme: 'dark' as const },
    };

    const result = parseImportFile(JSON.stringify(original));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.lessons).toEqual(original.lessons);
    expect(result.data.chapters).toEqual(original.chapters);
    expect(result.data.activity).toEqual(original.activity);
    expect(result.data.lastVisited).toBe(original.lastVisited);
    expect(result.data.preferences.theme).toBe('dark');
  });
});

/**
 * Taman Bermain state, added in schema version 2.
 *
 * The draft field is the only thing in the whole schema whose length the learner controls, so it
 * is the only thing that can fill `localStorage` on its own. It is truncated rather than rejected:
 * losing one oversized draft is a nuisance, but rejecting the whole file over it would cost the
 * learner every solved exercise they had (`security.md` — input limits, fail safe).
 */

describe('skema v2 — state Taman Bermain', () => {
  it('menaikkan versi skema ke 2', () => {
    expect(SCHEMA_VERSION).toBe(2);
  });

  it('data kosong punya peta soal kosong, bukan undefined', () => {
    expect(emptyData().exercises).toEqual({});
  });

  it('menerima state soal yang sah', () => {
    const result = parseLearningData({
      schemaVersion: 2,
      exercises: {
        'balik-urutan': { status: 'benar', attempts: 3, solvedAt: '2026-09-17T10:00:00.000Z' },
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.exercises['balik-urutan']?.status).toBe('benar');
    expect(result.data.exercises['balik-urutan']?.attempts).toBe(3);
  });

  it('membuang entri dengan status yang tidak dikenal', () => {
    const result = parseLearningData({
      schemaVersion: 2,
      exercises: { a: { status: 'sempurna', attempts: 1 }, b: { status: 'dicoba', attempts: 1 } },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.exercises.a).toBeUndefined();
    expect(result.data.exercises.b).toBeDefined();
  });

  it('menormalkan attempts yang negatif atau pecahan', () => {
    const result = parseLearningData({
      schemaVersion: 2,
      exercises: {
        a: { status: 'dicoba', attempts: -5 },
        b: { status: 'dicoba', attempts: 2.9 },
        c: { status: 'dicoba', attempts: 'banyak' },
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.exercises.a?.attempts).toBe(0);
    expect(result.data.exercises.b?.attempts).toBe(2);
    expect(result.data.exercises.c?.attempts).toBe(0);
  });

  it('MEMOTONG draf yang kelewat panjang, bukan menolak seluruh berkasnya', () => {
    const result = parseLearningData({
      schemaVersion: 2,
      exercises: {
        a: { status: 'dicoba', attempts: 1, code: 'x'.repeat(MAX_DRAFT_CHARS + 5000) },
        b: { status: 'benar', attempts: 1 },
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.exercises.a?.code).toHaveLength(MAX_DRAFT_CHARS);
    expect(result.data.exercises.b?.status).toBe('benar');
  });

  it('hanya menyimpan revealed bernilai true', () => {
    const result = parseLearningData({
      schemaVersion: 2,
      exercises: {
        a: { status: 'benar', attempts: 1, revealed: true },
        b: { status: 'benar', attempts: 1, revealed: false },
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.exercises.a?.revealed).toBe(true);
    expect(result.data.exercises.b?.revealed).toBeUndefined();
  });

  it('membuang entri yang bukan objek tanpa menjatuhkan sisanya', () => {
    const result = parseLearningData({
      schemaVersion: 2,
      exercises: { a: 'benar', b: { status: 'benar', attempts: 1 } },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.exercises.a).toBeUndefined();
    expect(result.data.exercises.b).toBeDefined();
  });
});

describe('migrasi v1 → v2', () => {
  it('menerima ekspor v1 dan memberinya peta soal kosong', () => {
    const v1 = {
      schemaVersion: 1,
      lessons: { 'a/b/c': { completedAt: '2026-08-01T09:00:00.000Z' } },
      chapters: {},
      activity: { '2026-08-01': 2 },
      lastVisited: 'a/b/c',
      preferences: { theme: 'dark' },
    };
    const result = parseLearningData(v1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.schemaVersion).toBe(2);
    expect(result.data.exercises).toEqual({});
    // Migrasi ini aditif murni — tidak boleh ada progres lama yang hilang karenanya.
    expect(result.data.lessons['a/b/c']?.completedAt).toBe('2026-08-01T09:00:00.000Z');
    expect(result.data.activity['2026-08-01']).toBe(2);
  });

  it('tetap menolak ekspor dari versi yang lebih baru lagi', () => {
    const result = parseLearningData({ schemaVersion: 3 });
    expect(result.ok).toBe(false);
  });
});
