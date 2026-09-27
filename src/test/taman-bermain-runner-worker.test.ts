import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorkerRunner } from '@/lib/taman-bermain/runner-worker';
import type { Scenario } from '@/lib/taman-bermain/types';

/**
 * The browser runner's handling of what comes back from the Worker.
 *
 * The Worker is a trust boundary: it executes code the learner typed, and that code can close the
 * wrapper it runs in and call `self.postMessage` itself. In this app's threat model that deceives
 * nobody but the person who typed it — but an unchecked reply would throw inside the message
 * handler, leave the promise unsettled, and make the reader wait out the whole timeout for what
 * should be an immediate, clear failure.
 *
 * jsdom has no `Worker`, so one is stubbed here. That is the point rather than a limitation: the
 * stub lets a malformed reply be sent deliberately, which a real Worker would not do on request.
 */

type Kirim = { id: number; sources: string[] };

/** Replies with whatever the test tells it to, including nonsense. */
class WorkerPalsu {
  static balasan: (pesan: Kirim) => unknown = () => undefined;
  static dibuat = 0;
  static dihentikan = 0;

  private listeners = new Map<string, Set<(event: unknown) => void>>();

  constructor() {
    WorkerPalsu.dibuat += 1;
  }

  addEventListener(jenis: string, fn: (event: unknown) => void): void {
    const set = this.listeners.get(jenis) ?? new Set();
    set.add(fn);
    this.listeners.set(jenis, set);
  }

  removeEventListener(jenis: string, fn: (event: unknown) => void): void {
    this.listeners.get(jenis)?.delete(fn);
  }

  postMessage(pesan: Kirim): void {
    const data = WorkerPalsu.balasan(pesan);
    if (data === undefined) return;
    queueMicrotask(() => {
      for (const fn of this.listeners.get('message') ?? []) fn({ data });
    });
  }

  terminate(): void {
    WorkerPalsu.dihentikan += 1;
  }
}

const scenario: Scenario = {
  id: 's1',
  name: 'cetak',
  visible: true,
  expect: { type: 'output', lines: ['1'] },
};

beforeEach(() => {
  WorkerPalsu.dibuat = 0;
  WorkerPalsu.dihentikan = 0;
  vi.stubGlobal('Worker', WorkerPalsu);
  vi.stubGlobal('Blob', class {});
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:palsu',
    revokeObjectURL: () => undefined,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function jalankan() {
  const runner = createWorkerRunner();
  try {
    return await runner.run({ code: 'console.log(1);', scenarios: [scenario], timeoutMs: 500 });
  } finally {
    runner.dispose();
  }
}

describe('createWorkerRunner — balasan yang sah', () => {
  it('menilai hasil yang bentuknya benar', async () => {
    WorkerPalsu.balasan = ({ id }) => ({
      id,
      status: 'ok',
      outcomes: [{ args: [[1]], value: undefined }],
    });

    const hasil = await jalankan();
    expect(hasil.status).toBe('ok');
    if (hasil.status !== 'ok') return;
    expect(hasil.results[0]?.passed).toBe(true);
    expect(hasil.consoleOutput).toEqual(['1']);
  });

  it('meneruskan crash beserta pesannya', async () => {
    WorkerPalsu.balasan = ({ id }) => ({
      id,
      status: 'crash',
      error: { name: 'SyntaxError', message: 'Unexpected token' },
    });

    const hasil = await jalankan();
    expect(hasil.status).toBe('crash');
    if (hasil.status !== 'crash') return;
    expect(hasil.message).toBe('SyntaxError: Unexpected token');
  });

  it('mengabaikan balasan dari jalan sebelumnya yang sudah ditinggalkan', async () => {
    WorkerPalsu.balasan = () => ({ id: 999, status: 'ok', outcomes: [] });

    // Tidak ada balasan ber-id benar, jadi yang benar adalah timeout — bukan menyelesaikan
    // promise ini dengan hasil milik jalan lain.
    const hasil = await jalankan();
    expect(hasil.status).toBe('timeout');
  }, 3000);
});

describe('createWorkerRunner — balasan yang cacat (batas kepercayaan)', () => {
  const cacat: [string, (id: number) => unknown][] = [
    ['outcomes bukan array', (id) => ({ id, status: 'ok', outcomes: 'bukan array' })],
    ['status tidak dikenal', (id) => ({ id, status: 'aneh', outcomes: [] })],
    ['outcome bukan objek', (id) => ({ id, status: 'ok', outcomes: ['bukan objek'] })],
    ['args bukan array', (id) => ({ id, status: 'ok', outcomes: [{ args: 'x', value: 1 }] })],
    [
      'args berisi yang bukan array',
      (id) => ({ id, status: 'ok', outcomes: [{ args: [1], value: 1 }] }),
    ],
  ];

  for (const [nama, buat] of cacat) {
    it(`melaporkan crash yang jelas saat ${nama}, bukan menggantung sampai timeout`, async () => {
      WorkerPalsu.balasan = ({ id }) => buat(id);

      const mulai = Date.now();
      const hasil = await jalankan();

      expect(hasil.status).toBe('crash');
      // Yang dijaga bukan cuma statusnya: pembelajar harus dapat jawaban SEKARANG, bukan setelah
      // menunggu seluruh anggaran waktu habis.
      expect(Date.now() - mulai).toBeLessThan(400);
    });
  }

  it('menghentikan Worker yang membalas cacat, karena keadaannya tidak lagi bisa dipercaya', async () => {
    WorkerPalsu.balasan = ({ id }) => ({ id, status: 'ok', outcomes: 'rusak' });
    await jalankan();
    expect(WorkerPalsu.dihentikan).toBeGreaterThan(0);
  });

  it('memberi pesan generik ke pembelajar, tanpa membocorkan isi balasannya', async () => {
    WorkerPalsu.balasan = ({ id }) => ({ id, status: 'ok', outcomes: [{ args: 'rahasia' }] });
    const hasil = await jalankan();
    expect(hasil.status).toBe('crash');
    if (hasil.status !== 'crash') return;
    expect(hasil.message).not.toContain('rahasia');
  });
});
