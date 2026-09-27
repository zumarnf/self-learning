import { describe, expect, it } from 'vitest';
import { grade } from '@/lib/taman-bermain/grade';
import { createVmRunner } from '@/lib/taman-bermain/runner-vm';
import type { CheckSpec } from '@/lib/taman-bermain/types';

/**
 * The orchestration: two layers, in a deliberate order, with a deliberate short-circuit.
 *
 * Constraints are checked before anything runs. If the exercise forbids functions and the answer
 * uses one, running it proves nothing — and a learner who broke a stated rule gets told that
 * immediately instead of watching five scenarios execute first (SDD §5.2).
 */

const SOAL_BALIK: CheckSpec = {
  engine: 'js',
  constraints: [
    {
      id: 'pakai-for',
      label: 'Memakai perulangan for',
      rule: { type: 'wajib-ada', pattern: '\\bfor\\s*\\(' },
    },
    {
      id: 'tanpa-fungsi',
      label: 'Tanpa function atau arrow',
      rule: { type: 'dilarang', pattern: '\\bfunction\\b|=>' },
    },
  ],
  scenarios: [
    {
      id: 's1',
      name: 'cetak 5 sampai 1',
      visible: true,
      expect: { type: 'output', lines: ['5', '4', '3', '2', '1'] },
    },
  ],
};

async function nilaiKode(check: CheckSpec, code: string) {
  const runner = createVmRunner();
  try {
    return await grade(check, code, runner);
  } finally {
    runner.dispose();
  }
}

describe('grade — mesin js', () => {
  it('meloloskan jawaban yang benar perilaku dan bentuknya', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, 'for (let i = 5; i >= 1; i--) console.log(i);');
    expect(hasil.passed).toBe(true);
  });

  it('meloloskan CARA LAIN yang sama benarnya — inti permintaan user', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, 'for (let i = 0; i < 5; i++) console.log(5 - i);');
    expect(hasil.passed).toBe(true);
  });

  it('meloloskan cara ketiga lewat array', async () => {
    const kode =
      'const a = [1,2,3,4,5];\nfor (let i = a.length - 1; i >= 0; i--) console.log(a[i]);';
    expect((await nilaiKode(SOAL_BALIK, kode)).passed).toBe(true);
  });

  it('MENOLAK keluaran benar yang dicetak manual tanpa for', async () => {
    const curang =
      'console.log(5); console.log(4); console.log(3); console.log(2); console.log(1);';
    const hasil = await nilaiKode(SOAL_BALIK, curang);
    expect(hasil.passed).toBe(false);
    expect(hasil.constraints.find((row) => row.id === 'pakai-for')?.passed).toBe(false);
  });

  it('MENOLAK forEach meski keluarannya benar', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, '[5,4,3,2,1].forEach((n) => console.log(n));');
    expect(hasil.passed).toBe(false);
    expect(hasil.constraints.find((row) => row.id === 'tanpa-fungsi')?.passed).toBe(false);
  });

  it('MENOLAK for yang urutannya naik', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, 'for (let i = 1; i <= 5; i++) console.log(i);');
    expect(hasil.passed).toBe(false);
    expect(hasil.constraints.every((row) => row.passed)).toBe(true);
    expect(hasil.scenarios[0]?.passed).toBe(false);
  });

  it('TIDAK menjalankan skenario saat ada batasan yang gagal', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, '[5,4,3,2,1].forEach((n) => console.log(n));');
    expect(hasil.scenarios).toHaveLength(0);
    expect(hasil.skipReason).toBe('batasan-gagal');
  });

  it('melaporkan timeout sebagai timeout, bukan sebagai jawaban salah', async () => {
    const check: CheckSpec = { ...SOAL_BALIK, constraints: [] };
    const hasil = await grade(check, 'for (;;) {}', createVmRunner(), { timeoutMs: 300 });
    expect(hasil.passed).toBe(false);
    expect(hasil.skipReason).toBe('timeout');
    expect(hasil.message).toBeTruthy();
  }, 5000);

  it('melaporkan crash sintaks dengan pesan, bukan halaman kosong', async () => {
    const hasil = await nilaiKode(
      { ...SOAL_BALIK, constraints: [] },
      'for (let i = 5; i-- console.log(i);',
    );
    expect(hasil.passed).toBe(false);
    expect(hasil.skipReason).toBe('crash');
    expect(hasil.message).toBeTruthy();
  });

  it('menolak kode kosong tanpa melempar', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, '');
    expect(hasil.passed).toBe(false);
  });

  it('mengumpulkan keluaran konsol untuk panel output', async () => {
    const hasil = await nilaiKode(SOAL_BALIK, 'for (let i = 5; i >= 1; i--) console.log(i);');
    expect(hasil.consoleOutput).toEqual(['5', '4', '3', '2', '1']);
  });

  it('menyebut mesin yang dipakai, supaya UI bisa menjelaskannya', async () => {
    expect((await nilaiKode(SOAL_BALIK, 'for(;;){break;}')).engine).toBe('js');
  });
});

describe('grade — mesin struktur', () => {
  const MIGRATION: CheckSpec = {
    engine: 'struktur',
    bahasa: 'php',
    assertions: [
      {
        id: 'schema-create',
        label: 'Memanggil Schema::create',
        hint: 'Migration membuat tabel lewat Schema::create(...).',
        rule: { type: 'wajib-ada', pattern: 'Schema::create\\s*\\(' },
      },
      {
        id: 'timestamps',
        label: 'Menyertakan timestamps',
        hint: 'Panggil $table->timestamps() supaya created_at dan updated_at ada.',
        rule: { type: 'wajib-ada', pattern: '\\$table->timestamps\\(\\)' },
      },
    ],
  };

  it('meloloskan migration yang bentuknya benar', async () => {
    const php =
      "Schema::create('catatan', function (Blueprint $table) {\n$table->id();\n$table->timestamps();\n});";
    const hasil = await nilaiKode(MIGRATION, php);
    expect(hasil.passed).toBe(true);
  });

  it('menggagalkan yang kurang, dan menyebut apa yang kurang', async () => {
    const php = "Schema::create('catatan', function (Blueprint $table) { $table->id(); });";
    const hasil = await nilaiKode(MIGRATION, php);
    expect(hasil.passed).toBe(false);
    expect(hasil.constraints.find((row) => row.id === 'timestamps')?.detail).toContain(
      'created_at',
    );
  });

  it('TIDAK PERNAH menjalankan apa pun, dan mengatakannya', async () => {
    // Batas kejujuran mesin ini (PRD §7 R-3): UI harus bisa membedakannya dari mesin js.
    const hasil = await nilaiKode(MIGRATION, 'Schema::create(); $table->timestamps();');
    expect(hasil.scenarios).toHaveLength(0);
    expect(hasil.skipReason).toBe('tanpa-eksekusi');
    expect(hasil.consoleOutput).toHaveLength(0);
    expect(hasil.engine).toBe('struktur');
  });
});
