import { describe, expect, it } from 'vitest';
import { compareOutput, deepEqual, display } from '@/lib/taman-bermain/compare';

/**
 * How an answer is judged "the same" as the expected value.
 *
 * These rules are written down and tested because exercise authors need to predict them. A
 * comparison that is stricter than authors assume produces false failures; one that is looser
 * lets wrong answers through. Both destroy trust in the grader faster than a missing feature.
 */

describe('deepEqual', () => {
  it('menyamakan array dengan isi sama', () => {
    expect(deepEqual([3, 2, 1], [3, 2, 1])).toBe(true);
  });

  it('membedakan array yang urutannya berbeda — urutan DIHITUNG', () => {
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
  });

  it('mengabaikan urutan kunci objek — urutan kunci TIDAK dihitung', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('menyamakan NaN dengan NaN', () => {
    // Object.is memberi jawaban yang berguna di sini; === tidak.
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it('membedakan 0 dari -0', () => {
    expect(deepEqual(0, -0)).toBe(false);
  });

  it('membedakan angka dari string berisi angka', () => {
    expect(deepEqual(5, '5')).toBe(false);
  });

  it('membedakan null dari undefined', () => {
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('menyamakan objek bersarang', () => {
    expect(deepEqual({ a: [{ b: 1 }] }, { a: [{ b: 1 }] })).toBe(true);
  });

  it('membedakan objek yang punya kunci tambahan', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });

  it('membedakan array dari objek mirip-array', () => {
    expect(deepEqual([1], { 0: 1, length: 1 })).toBe(false);
  });
});

describe('compareOutput', () => {
  it('mengabaikan spasi di ujung tiap baris', () => {
    expect(compareOutput(['5  ', ' 4'], ['5', '4'])).toBe(true);
  });

  it('mengabaikan baris kosong di akhir', () => {
    expect(compareOutput(['5', '4', '', ''], ['5', '4'])).toBe(true);
  });

  it('TIDAK mengabaikan baris kosong di tengah', () => {
    expect(compareOutput(['5', '', '4'], ['5', '4'])).toBe(false);
  });

  it('membedakan jumlah baris yang berbeda', () => {
    expect(compareOutput(['5', '4'], ['5', '4', '3'])).toBe(false);
  });

  it('menganggap keluaran kosong sama dengan harapan kosong', () => {
    expect(compareOutput([], [])).toBe(true);
  });
});

describe('display', () => {
  it('menampilkan array secara ringkas', () => {
    expect(display([3, 2, 1])).toBe('[3, 2, 1]');
  });

  it('membedakan string dari angka secara kasatmata', () => {
    expect(display('5')).toBe('"5"');
    expect(display(5)).toBe('5');
  });

  it('menampilkan undefined dan NaN apa adanya, bukan sebagai null', () => {
    // JSON.stringify mengubah keduanya jadi null — persis informasi yang paling dibutuhkan
    // pembelajar saat menebak kenapa jawabannya salah.
    expect(display(undefined)).toBe('undefined');
    expect(display(NaN)).toBe('NaN');
  });

  it('menampilkan objek dengan kunci terurut supaya diff terbaca', () => {
    expect(display({ b: 2, a: 1 })).toBe('{ a: 1, b: 2 }');
  });

  it('memotong nilai yang sangat panjang supaya panel hasil tidak meledak', () => {
    const panjang = display(Array.from({ length: 500 }, (_, i) => i));
    expect(panjang.length).toBeLessThan(300);
    expect(panjang).toContain('…');
  });
});

describe('display — urutan key untuk contoh', () => {
  it('mempertahankan urutan penulis saat sortKeys dimatikan', () => {
    // Contoh di soal dibaca pemula. { id, nama, anak } terbaca wajar; { anak, id, nama } terlihat
    // seperti bentuk yang berbeda padahal sama.
    expect(display({ id: 1, nama: 'A', anak: [] }, { sortKeys: false })).toBe(
      '{ id: 1, nama: "A", anak: [] }',
    );
  });

  it('tetap mengurutkan secara bawaan, supaya diff di panel hasil sejajar', () => {
    expect(display({ id: 1, nama: 'A', anak: [] })).toBe('{ anak: [], id: 1, nama: "A" }');
  });
});
