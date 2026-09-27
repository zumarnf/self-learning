import { describe, expect, it } from 'vitest';
import { createVmRunner } from '@/lib/taman-bermain/runner-vm';
import type { Scenario } from '@/lib/taman-bermain/types';

/**
 * The Node-side runner, and with it the security spike from WBS F1-3.
 *
 * This runner exists so `grade()` can be exercised by tests at all. If grading only lived inside
 * a browser Worker, nothing could prove an exercise's official answer actually passes its own
 * grader — and that is the single worst failure this feature can have (PRD §7 R-1).
 */

const cetak = (lines: string[]): Scenario => ({
  id: 'cetak',
  name: 'keluaran',
  visible: true,
  expect: { type: 'output', lines },
});

const nilai = (expression: string, equals: unknown): Scenario => ({
  id: 'nilai',
  name: 'nilai kembalian',
  visible: true,
  expect: { type: 'nilai', expression, equals },
});

describe('createVmRunner — perilaku dasar', () => {
  it('menangkap console.log dan meloloskan keluaran yang cocok', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'for (let i = 5; i >= 1; i--) console.log(i);',
      scenarios: [cetak(['5', '4', '3', '2', '1'])],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });

  it('menggagalkan keluaran yang urutannya terbalik', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'for (let i = 1; i <= 5; i++) console.log(i);',
      scenarios: [cetak(['5', '4', '3', '2', '1'])],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(false);
    expect(hasil.results[0]?.actualDisplay).toContain('1');
  });

  it('mengevaluasi ekspresi terhadap deklarasi pembelajar', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'function balik(a) { const out = []; for (let i = a.length - 1; i >= 0; i--) out.push(a[i]); return out; }',
      scenarios: [nilai('balik([1, 2, 3])', [3, 2, 1])],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });

  it('menjalankan prelude sebelum kode pembelajar', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'const hasil = data.map((n) => n * 2);',
      scenarios: [{ ...nilai('hasil', [2, 4]), prelude: 'const data = [1, 2];' }],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });

  it('menjalankan tiap skenario dengan state yang bersih', async () => {
    // Skenario kedua tidak boleh melihat sisa dari yang pertama.
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'globalThis.jejak = (globalThis.jejak ?? 0) + 1;',
      scenarios: [nilai('globalThis.jejak', 1), { ...nilai('globalThis.jejak', 1), id: 'kedua' }],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results.every((row) => row.passed)).toBe(true);
  });

  it('menunggu nilai yang berupa Promise', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'const ambil = async () => { await new Promise((r) => setTimeout(r, 5)); return 42; };',
      scenarios: [nilai('ambil()', 42)],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });
});

describe('createVmRunner — jalur tidak bahagia', () => {
  it('melaporkan error runtime per skenario tanpa menjatuhkan skenario lain', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'const balik = (a) => a.length;',
      scenarios: [nilai('balik(undefined)', 0), nilai('balik([1, 2])', 2)],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(false);
    expect(hasil.results[0]?.error).toBeTruthy();
    expect(hasil.results[1]?.passed).toBe(true);
  });

  it('melaporkan crash saat kode tidak bisa diurai sama sekali', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'for (let i = 5; i >= 1; i--  console.log(i);',
      scenarios: [cetak(['5'])],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('crash');
    if (hasil.status !== 'crash') return;
    expect(hasil.message).toBeTruthy();
    expect(hasil.message).not.toContain('at Object.');
  });

  it('BERHENTI pada perulangan tak berujung, bukan menggantung selamanya', async () => {
    // Spike F1-3. Kalau ini gagal, seluruh fitur tidak boleh dirilis: soal perulangan adalah
    // tempat paling wajar seorang pembelajar menulis loop yang tidak berhenti.
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'while (true) {}',
      scenarios: [cetak(['5'])],
      timeoutMs: 300,
    });
    runner.dispose();

    expect(hasil.status).toBe('timeout');
  }, 5000);

  it('menganggap keluaran kosong sebagai hasil yang sah untuk dibandingkan', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'const a = 1;',
      scenarios: [cetak([])],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });
});

describe('createVmRunner — batas keamanan (spike F1-3)', () => {
  it('kode pembelajar TIDAK bisa menjangkau localStorage', async () => {
    // NFR-TB-S1. Ini properti yang membuat data belajar aman tanpa sandbox tambahan:
    // localStorage adalah API Window, dan konteks eksekusi ini tidak punya Window.
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'const ada = typeof localStorage;',
      scenarios: [nilai('ada', 'undefined')],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });

  it('kode pembelajar TIDAK bisa menjangkau document', async () => {
    const runner = createVmRunner();
    const hasil = await runner.run({
      code: 'const ada = typeof document;',
      scenarios: [nilai('ada', 'undefined')],
      timeoutMs: 2000,
    });
    runner.dispose();

    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
  });
});

describe('createVmRunner — paritas dengan scope Worker', () => {
  // Setiap API host yang ada di Worker tapi tidak di sini akan membuat soal yang memakainya
  // lolos di browser dan melempar ReferenceError di CI. Itu bentuk paling buruk dari
  // "dua penilai berbeda putusan", karena yang satu tidak pernah terlihat sampai dirilis.
  const apiHost = ['URLSearchParams', 'URL', 'setTimeout', 'structuredClone', 'queueMicrotask'];

  for (const nama of apiHost) {
    it(`menyediakan ${nama}, sama seperti Worker`, async () => {
      const runner = createVmRunner();
      const hasil = await runner.run({
        code: `const ada = typeof ${nama};`,
        scenarios: [nilai('ada', 'function')],
        timeoutMs: 2000,
      });
      runner.dispose();

      expect(hasil.status).toBe('ok');
      if (hasil.status !== 'ok') return;
      expect(hasil.results[0]?.passed, `${nama} tidak tersedia di runner test`).toBe(true);
    });
  }
});
