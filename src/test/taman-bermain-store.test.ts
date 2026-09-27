import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_DRAFT_CHARS } from '@/lib/learning/schema';
import {
  __resetStoreForTests,
  recordExerciseAttempt,
  revealExerciseSolution,
  setExerciseDraft,
  useLearningStore,
} from '@/lib/learning/store';

/**
 * Exercise progress, read back through the hook the app actually uses.
 *
 * The behaviour worth guarding here is the streak rule. Activity must count solving an exercise
 * once, not once per press of "Periksa" — otherwise the streak, which exists to reward showing up,
 * would instead reward mashing a button (SDD §6.4).
 */

/**
 * No `localStorage.clear()` here, and that is not an omission: jsdom in this project exposes
 * neither `localStorage` nor `window.localStorage`, so `storage.ts` takes its unavailable branch
 * and the store runs memory-only. That makes `__resetStoreForTests()` a genuinely clean slate —
 * and means these tests also cover the degraded path a learner hits when a browser blocks
 * storage, which is one of the four states the UI has to handle.
 */
beforeEach(() => {
  __resetStoreForTests();
});

function bacaStore() {
  return renderHook(() => useLearningStore()).result;
}

describe('recordExerciseAttempt', () => {
  it('mencatat percobaan yang gagal tanpa menandainya benar', () => {
    const store = bacaStore();
    act(() => recordExerciseAttempt('balik-urutan', false));

    expect(store.current.data.exercises['balik-urutan']?.status).toBe('dicoba');
    expect(store.current.data.exercises['balik-urutan']?.attempts).toBe(1);
    expect(store.current.data.exercises['balik-urutan']?.solvedAt).toBeUndefined();
  });

  it('menandai benar dan mencatat waktunya', () => {
    const store = bacaStore();
    act(() => recordExerciseAttempt('balik-urutan', true));

    expect(store.current.data.exercises['balik-urutan']?.status).toBe('benar');
    expect(store.current.data.exercises['balik-urutan']?.solvedAt).toBeTruthy();
  });

  it('menjumlahkan percobaan', () => {
    const store = bacaStore();
    act(() => {
      recordExerciseAttempt('balik-urutan', false);
      recordExerciseAttempt('balik-urutan', false);
      recordExerciseAttempt('balik-urutan', true);
    });

    expect(store.current.data.exercises['balik-urutan']?.attempts).toBe(3);
  });

  it('TIDAK menurunkan status benar kembali jadi dicoba', () => {
    // Sudah pernah benar berarti pernah bisa. Mengutak-atik kode sesudahnya tidak menghapus itu.
    const store = bacaStore();
    act(() => {
      recordExerciseAttempt('balik-urutan', true);
      recordExerciseAttempt('balik-urutan', false);
    });

    expect(store.current.data.exercises['balik-urutan']?.status).toBe('benar');
  });

  it('menaikkan aktivitas harian TEPAT SEKALI meski Periksa ditekan berkali-kali', () => {
    const store = bacaStore();
    act(() => {
      recordExerciseAttempt('balik-urutan', true);
      recordExerciseAttempt('balik-urutan', true);
      recordExerciseAttempt('balik-urutan', true);
    });

    const total = Object.values(store.current.data.activity).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(1);
  });

  it('tidak menaikkan aktivitas untuk percobaan yang gagal', () => {
    const store = bacaStore();
    act(() => recordExerciseAttempt('balik-urutan', false));

    expect(Object.keys(store.current.data.activity)).toHaveLength(0);
  });

  it('menghitung dua soal berbeda sebagai dua aktivitas', () => {
    const store = bacaStore();
    act(() => {
      recordExerciseAttempt('soal-a', true);
      recordExerciseAttempt('soal-b', true);
    });

    const total = Object.values(store.current.data.activity).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(2);
  });
});

describe('setExerciseDraft', () => {
  it('menyimpan draf tanpa membuat entri berstatus benar', () => {
    const store = bacaStore();
    act(() => setExerciseDraft('balik-urutan', 'for (let i = 5; i >= 1; i--) {}'));

    expect(store.current.data.exercises['balik-urutan']?.code).toContain('for');
    expect(store.current.data.exercises['balik-urutan']?.status).toBe('dicoba');
    expect(store.current.data.exercises['balik-urutan']?.attempts).toBe(0);
  });

  it('memotong draf di batas, bukan menolaknya', () => {
    const store = bacaStore();
    act(() => setExerciseDraft('balik-urutan', 'x'.repeat(MAX_DRAFT_CHARS + 1000)));

    expect(store.current.data.exercises['balik-urutan']?.code).toHaveLength(MAX_DRAFT_CHARS);
  });

  it('membuang draf kosong alih-alih menyimpan string kosong', () => {
    const store = bacaStore();
    act(() => {
      setExerciseDraft('balik-urutan', 'sesuatu');
      setExerciseDraft('balik-urutan', '   ');
    });

    expect(store.current.data.exercises['balik-urutan']?.code).toBeUndefined();
  });

  it('tidak menghapus status benar saat draf diubah sesudahnya', () => {
    const store = bacaStore();
    act(() => {
      recordExerciseAttempt('balik-urutan', true);
      setExerciseDraft('balik-urutan', 'coretan baru');
    });

    expect(store.current.data.exercises['balik-urutan']?.status).toBe('benar');
  });
});

describe('revealExerciseSolution', () => {
  it('menandai kunci jawaban pernah dibuka', () => {
    const store = bacaStore();
    act(() => revealExerciseSolution('balik-urutan'));

    expect(store.current.data.exercises['balik-urutan']?.revealed).toBe(true);
  });

  it('tidak menghapus status yang sudah benar', () => {
    const store = bacaStore();
    act(() => {
      recordExerciseAttempt('balik-urutan', true);
      revealExerciseSolution('balik-urutan');
    });

    expect(store.current.data.exercises['balik-urutan']?.status).toBe('benar');
    expect(store.current.data.exercises['balik-urutan']?.revealed).toBe(true);
  });
});
