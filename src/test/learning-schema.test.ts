import { describe, expect, it } from 'vitest';
import {
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
