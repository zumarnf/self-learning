import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { buildScenarioSource, formatConsoleArgs, judgeScenario } from '@/lib/taman-bermain/runner';
import { WORKER_SOURCE } from '@/lib/taman-bermain/worker-source';
import type { Scenario } from '@/lib/taman-bermain/types';

/**
 * The Worker body, exercised without a browser.
 *
 * It is a string, so nothing type-checks it and nothing would notice a syntax error until a
 * learner pressed a button. These tests close that gap: the source is evaluated against a fake
 * `self`, driven through its real message protocol, and its replies are fed to the same
 * `judgeScenario` the browser would call.
 *
 * What this does NOT prove is that a browser will construct a Blob Worker from it. That needs a
 * real browser, and it is stated as unverified rather than implied — see the work summary.
 */

type Balasan = { id: number; status: string; outcomes?: unknown[]; error?: unknown };

/** Evaluate the worker source with a fake `self`, then drive its protocol. */
async function jalankanWorker(code: string, scenarios: Scenario[]) {
  const balasan: Balasan[] = [];
  const self_: Record<string, unknown> = {
    postMessage: (pesan: Balasan) => void balasan.push(pesan),
  };

  const sandbox = createContext({
    self: self_,
    structuredClone,
    setTimeout,
    clearTimeout,
    Promise,
    Error,
    SyntaxError,
    Array,
    String,
    Function,
  });

  runInContext(WORKER_SOURCE, sandbox, { timeout: 2000 });

  const onmessage = self_.onmessage as (event: { data: unknown }) => void;
  onmessage({
    data: { id: 7, sources: scenarios.map((s) => buildScenarioSource(code, s)) },
  });

  // The handler runs an async IIFE; give the microtask queue and any timers room to finish.
  await new Promise((resolve) => setTimeout(resolve, 60));

  return balasan;
}

const cetak = (lines: string[]): Scenario => ({
  id: 'cetak',
  name: 'keluaran',
  visible: true,
  expect: { type: 'output', lines },
});

const nilai = (expression: string, equals: unknown): Scenario => ({
  id: 'nilai',
  name: 'nilai',
  visible: true,
  expect: { type: 'nilai', expression, equals },
});

describe('WORKER_SOURCE — bisa diurai dan protokolnya bekerja', () => {
  it('adalah JavaScript yang sah', () => {
    // Kalau string ini rusak, tanpa test ini kerusakannya baru ketahuan saat pembelajar
    // menekan tombol — tidak ada type-check yang menjaganya.
    expect(() => new Function(WORKER_SOURCE)).not.toThrow();
  });

  it('membalas dengan id yang sama seperti yang dikirim', async () => {
    const balasan = await jalankanWorker('console.log(1);', [cetak(['1'])]);
    expect(balasan).toHaveLength(1);
    expect(balasan[0]?.id).toBe(7);
    expect(balasan[0]?.status).toBe('ok');
  });

  it('menangkap console.log dan hasilnya dinilai sama seperti jalur Node', async () => {
    const scenario = cetak(['5', '4', '3', '2', '1']);
    const balasan = await jalankanWorker('for (let i = 5; i >= 1; i--) console.log(i);', [
      scenario,
    ]);

    const outcome = (balasan[0]?.outcomes as { args: unknown[][] }[])[0];
    const lines = (outcome?.args ?? []).map((args) => formatConsoleArgs(args));
    expect(judgeScenario(scenario, { lines, value: undefined }).passed).toBe(true);
  });

  it('mengembalikan nilai ekspresi', async () => {
    const balasan = await jalankanWorker('const x = [3, 2, 1];', [nilai('x', [3, 2, 1])]);
    const outcome = (balasan[0]?.outcomes as { value: unknown }[])[0];
    expect(outcome?.value).toEqual([3, 2, 1]);
  });

  it('menunggu Promise sebelum membalas', async () => {
    const kode =
      'const ambil = async () => { await new Promise((r) => setTimeout(r, 5)); return 42; };';
    const balasan = await jalankanWorker(kode, [nilai('ambil()', 42)]);
    const outcome = (balasan[0]?.outcomes as { value: unknown }[])[0];
    expect(outcome?.value).toBe(42);
  });

  it('melaporkan error runtime sebagai pasangan name dan message, bukan stack trace', async () => {
    const balasan = await jalankanWorker('const f = (a) => a.length;', [nilai('f(undefined)', 0)]);
    const outcome = (balasan[0]?.outcomes as { error?: { name: string; message: string } }[])[0];
    expect(outcome?.error?.name).toBe('TypeError');
    expect(outcome?.error?.message).toBeTruthy();
    expect(JSON.stringify(outcome?.error)).not.toContain('at ');
  });

  it('melaporkan crash saat sumbernya tidak bisa diurai sama sekali', async () => {
    const balasan = await jalankanWorker('for (let i = 5; i-- console.log(i);', [cetak(['5'])]);
    expect(balasan[0]?.status).toBe('crash');
    expect((balasan[0]?.error as { message: string }).message).toBeTruthy();
  });

  it('MENGGANTI nilai yang tidak bisa di-clone, bukan meledak saat dikirim', async () => {
    // Jawaban pembelajar sah-sah saja mengembalikan fungsi. Tanpa penyaringan ini, postMessage
    // melempar DataCloneError dan penilainya mati alih-alih menyatakan jawabannya salah.
    const balasan = await jalankanWorker('const f = () => () => 1;', [nilai('f()', 1)]);
    const outcome = (balasan[0]?.outcomes as { value: unknown }[])[0];
    expect(typeof outcome?.value).toBe('string');
    expect(() => structuredClone(outcome?.value)).not.toThrow();
  });

  it('menjalankan setiap skenario, bukan berhenti di yang pertama', async () => {
    const balasan = await jalankanWorker('const f = (n) => n * 2;', [
      { ...nilai('f(1)', 2), id: 'a' },
      { ...nilai('f(2)', 4), id: 'b' },
      { ...nilai('f(3)', 6), id: 'c' },
    ]);
    expect((balasan[0]?.outcomes as unknown[]).length).toBe(3);
  });
});
