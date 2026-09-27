import { describe, expect, it } from 'vitest';
import { checkConstraints, checkStructure } from '@/lib/taman-bermain/check';
import type { Constraint, StructuralAssertion } from '@/lib/taman-bermain/types';

/**
 * Layer 1 of grading: rules about the shape of the answer, checked without running anything.
 *
 * This is the layer that makes the exercise in the brief enforceable — "must use a for loop, no
 * functions allowed". Behaviour alone cannot express it, because printing five numbers by hand
 * produces exactly the right output (PRD §2.2).
 */

const WAJIB_FOR: Constraint = {
  id: 'pakai-for',
  label: 'Memakai perulangan for',
  rule: { type: 'wajib-ada', pattern: '\\bfor\\s*\\(' },
};

const TANPA_FUNGSI: Constraint = {
  id: 'tanpa-fungsi',
  label: 'Tidak mendeklarasikan function atau arrow function',
  rule: { type: 'dilarang', pattern: '\\bfunction\\b|=>' },
};

describe('checkConstraints', () => {
  it('meloloskan jawaban yang memenuhi semua aturan', () => {
    const hasil = checkConstraints(
      'for (let i = 5; i >= 1; i--) console.log(i);',
      [WAJIB_FOR, TANPA_FUNGSI],
      'js',
    );
    expect(hasil.every((row) => row.passed)).toBe(true);
  });

  it('menggagalkan jawaban yang benar keluarannya tapi tanpa for — inti lapis ini', () => {
    const curang = 'console.log(5); console.log(4); console.log(3);';
    const hasil = checkConstraints(curang, [WAJIB_FOR], 'js');
    expect(hasil[0]?.passed).toBe(false);
  });

  it('menggagalkan jawaban yang memakai arrow function saat dilarang', () => {
    const hasil = checkConstraints('[5, 4].forEach((n) => console.log(n));', [TANPA_FUNGSI], 'js');
    expect(hasil[0]?.passed).toBe(false);
  });

  it('memberi detail yang menunjuk, bukan sekadar mengulang label', () => {
    const hasil = checkConstraints('console.log(5);', [WAJIB_FOR], 'js');
    expect(hasil[0]?.detail).toBeTruthy();
    expect(hasil[0]?.detail).not.toBe(hasil[0]?.label);
  });

  it('tidak terkecoh kata di dalam komentar', () => {
    // Ini alasan normalizeSource ada. Tanpa itu, komentar ini meloloskan jawaban.
    const hasil = checkConstraints('// pakai for\nconsole.log(5);', [WAJIB_FOR], 'js');
    expect(hasil[0]?.passed).toBe(false);
  });

  it('tidak terkecoh kata terlarang di dalam string', () => {
    const jujur = 'for (const x of ["function"]) console.log(x);';
    const hasil = checkConstraints(jujur, [TANPA_FUNGSI], 'js');
    expect(hasil[0]?.passed).toBe(true);
  });

  it('menghitung maks-baris hanya pada baris yang berisi kode', () => {
    const src = 'let a = 1;\n\n// komentar\nlet b = 2;';
    const batas: Constraint = {
      id: 'ringkas',
      label: 'Maksimal 2 baris kode',
      rule: { type: 'maks-baris', value: 2 },
    };
    expect(checkConstraints(src, [batas], 'js')[0]?.passed).toBe(true);
  });

  it('gagal tertutup saat pola regexnya rusak, bukan melempar', () => {
    // Test integritas seharusnya menangkap ini lebih dulu. Kalau toh lolos, pembelajar harus
    // melihat baris gagal yang jelas — bukan halaman putih.
    const rusak: Constraint = {
      id: 'rusak',
      label: 'Pola rusak',
      rule: { type: 'wajib-ada', pattern: '([' },
    };
    const hasil = checkConstraints('let a = 1;', [rusak], 'js');
    expect(hasil[0]?.passed).toBe(false);
    expect(hasil[0]?.detail).toContain('pola');
  });

  it('mengembalikan satu baris hasil per batasan, urutannya terjaga', () => {
    const hasil = checkConstraints('console.log(1);', [WAJIB_FOR, TANPA_FUNGSI], 'js');
    expect(hasil.map((row) => row.id)).toEqual(['pakai-for', 'tanpa-fungsi']);
  });
});

describe('checkStructure', () => {
  const MIGRATION: StructuralAssertion[] = [
    {
      id: 'schema-create',
      label: 'Memanggil Schema::create',
      hint: 'Migration membuat tabel lewat Schema::create(...).',
      rule: { type: 'wajib-ada', pattern: 'Schema::create\\s*\\(' },
    },
    {
      id: 'timestamps',
      label: 'Menyertakan timestamps',
      hint: 'Eloquent mengandalkan created_at dan updated_at — panggil $table->timestamps().',
      rule: { type: 'wajib-ada', pattern: '\\$table->timestamps\\(\\)' },
    },
  ];

  it('meloloskan migration yang bentuknya benar', () => {
    const php = [
      "Schema::create('catatan', function (Blueprint $table) {",
      '    $table->id();',
      '    $table->timestamps();',
      '});',
    ].join('\n');
    expect(checkStructure(php, MIGRATION, 'php').every((row) => row.passed)).toBe(true);
  });

  it('menggagalkan migration yang lupa timestamps, dan menyebut apa yang kurang', () => {
    const php = "Schema::create('catatan', function (Blueprint $table) { $table->id(); });";
    const hasil = checkStructure(php, MIGRATION, 'php');
    expect(hasil[0]?.passed).toBe(true);
    expect(hasil[1]?.passed).toBe(false);
    expect(hasil[1]?.detail).toContain('created_at');
  });

  it('MELIHAT isi string, karena nama tabel dan kolom memang hidup di sana', () => {
    // Keputusan sadar, bukan kelalaian. Soal Laravel menanyakan "apakah kolomnya bernama judul
    // dan bertipe string" — nama itu ada di dalam literal string, dan mengosongkannya menyisakan
    // nama method saja untuk diperiksa. Lihat NormalizeOptions.keepStrings.
    const php = "Schema::create('catatan', function ($table) { $table->timestamps(); });";
    expect(checkStructure(php, MIGRATION, 'php').every((row) => row.passed)).toBe(true);
  });

  it('TETAP mengosongkan komentar, yang justru sumber positif palsu sebenarnya', () => {
    // Inilah kekeliruan yang benar-benar terjadi: pembelajar menulis rencananya sebagai komentar
    // lalu mengira sudah mengerjakannya.
    const php = ['// Schema::create dan $table->timestamps() menyusul', '$a = 1;'].join('\n');
    const hasil = checkStructure(php, MIGRATION, 'php');
    expect(hasil.every((row) => !row.passed)).toBe(true);
  });

  // Penyaringan harus terjadi DI DATABASE, sebelum get(). Memanggil where() pada hasil get()
  // tetap PHP yang sah dan hasilnya benar — tapi seluruh tabel sudah terlanjur ditarik ke memori.
  // Aturan yang hanya bisa dinyatakan lewat urutan, bukan lewat keberadaan.
  const URUTAN: StructuralAssertion[] = [
    {
      id: 'saring-di-db',
      label: 'where() dipanggil sebelum get()',
      hint: 'where() setelah get() menyaring di PHP — seluruh baris tabel sudah terlanjur diambil.',
      rule: { type: 'berurutan', patterns: ['->where\\(', '->get\\('] },
    },
  ];

  it('meloloskan rantai query yang urutannya benar', () => {
    const php = "Post::query()->where('aktif', true)->get();";
    expect(checkStructure(php, URUTAN, 'php')[0]?.passed).toBe(true);
  });

  it('menggagalkan rantai query yang urutannya terbalik, meski hasil akhirnya sama', () => {
    const php = "Post::query()->get()->where('aktif', true);";
    expect(checkStructure(php, URUTAN, 'php')[0]?.passed).toBe(false);
  });

  it('menggagalkan aturan berurutan saat salah satu polanya tidak ada sama sekali', () => {
    expect(checkStructure('Post::query()->get();', URUTAN, 'php')[0]?.passed).toBe(false);
  });
});

describe('checkStructure — SQL tidak peka huruf besar kecil', () => {
  const ASERSI: StructuralAssertion[] = [
    {
      id: 'group-by',
      label: 'Memakai GROUP BY',
      hint: 'Belum ada GROUP BY.',
      rule: { type: 'wajib-ada', pattern: 'group\\s+by\\s+status' },
    },
    {
      id: 'urutan',
      label: 'FROM sebelum GROUP BY',
      hint: 'Urutannya salah.',
      rule: { type: 'berurutan', patterns: ['from\\s+pesanan', 'group\\s+by'] },
    },
  ];

  it('mencocokkan kata kunci SQL apa pun penulisan hurufnya', () => {
    // Kata kunci SQL memang tidak peka huruf besar kecil. Menuntut huruf kapital akan menolak
    // jawaban yang benar hanya karena gaya penulisan.
    for (const src of [
      'SELECT status, COUNT(*) FROM pesanan GROUP BY status;',
      'select status, count(*) from pesanan group by status;',
      'Select Status, Count(*) From Pesanan Group By Status;',
    ]) {
      expect(
        checkStructure(src, ASERSI, 'sql').every((row) => row.passed),
        src,
      ).toBe(true);
    }
  });

  it('tetap peka huruf besar kecil untuk bahasa lain', () => {
    const php: StructuralAssertion[] = [
      { id: 'x', label: 'x', hint: 'x', rule: { type: 'wajib-ada', pattern: 'Schema::create' } },
    ];
    expect(checkStructure('schema::create();', php, 'php')[0]?.passed).toBe(false);
  });

  // Only keywords and unquoted identifiers are case-insensitive. PostgreSQL compares string
  // contents exactly, so `kota = 'bandung'` returns no rows when the data says 'Bandung', and a
  // grader that passes it tells the learner "correct" about a query that returns nothing.
  const KOTA: StructuralAssertion[] = [
    {
      id: 'kota',
      label: 'Menyaring kota',
      hint: 'Belum ada kota.',
      rule: { type: 'wajib-ada', pattern: "where\\s+kota\\s*=\\s*'Bandung'" },
    },
  ];

  it('isi string SQL tetap peka huruf besar kecil', () => {
    expect(
      checkStructure("SELECT nama FROM pengguna WHERE kota = 'bandung';", KOTA, 'sql')[0]?.passed,
    ).toBe(false);
    expect(
      checkStructure("SELECT nama FROM pengguna WHERE kota = 'BANDUNG';", KOTA, 'sql')[0]?.passed,
    ).toBe(false);
  });

  it('kata kunci di sekitar string tetap tidak peka huruf besar kecil', () => {
    for (const src of [
      "SELECT nama FROM pengguna WHERE kota = 'Bandung';",
      "select nama from pengguna where KOTA = 'Bandung';",
    ]) {
      expect(checkStructure(src, KOTA, 'sql')[0]?.passed, src).toBe(true);
    }
  });

  it('kutip tunggal ganda di dalam string tidak membalik batas string', () => {
    // `''` is one quote inside a SQL string. Miscounting it would treat the rest of the string
    // as code and lower-case it.
    const judul: StructuralAssertion[] = [
      { id: 'j', label: 'j', hint: 'j', rule: { type: 'wajib-ada', pattern: "'Kopi''s Bandung'" } },
    ];
    expect(checkStructure("SELECT 'Kopi''s Bandung';", judul, 'sql')[0]?.passed).toBe(true);
    expect(checkStructure("SELECT 'kopi''s bandung';", judul, 'sql')[0]?.passed).toBe(false);
  });
});
