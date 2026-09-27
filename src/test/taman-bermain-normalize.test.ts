import { describe, expect, it } from 'vitest';
import { normalizeSource } from '@/lib/taman-bermain/normalize';

/**
 * The constraint layer matches patterns against normalized source, never raw text.
 *
 * Without this step a rule like "must use a for loop" is satisfied by the comment `// pakai for`,
 * and "no functions allowed" is violated by the string `"function"`. Both are false readings of
 * code the learner wrote correctly, and both would be blamed on the exercise rather than the
 * grader (SDD §4.3).
 */

describe('normalizeSource — JavaScript', () => {
  it('membuang komentar satu baris', () => {
    expect(normalizeSource('// pakai for\nlet a = 1;', 'js')).not.toContain('for');
  });

  it('tidak menganggap // di dalam string sebagai awal komentar', () => {
    // Kode setelah string itu nyata dan harus selamat. Sengaja SEBARIS: kalau `for` ditaruh di
    // baris berikutnya, regex naif pun lolos karena berhenti di newline — test yang lolos karena
    // kebetulan tidak membuktikan apa pun.
    const src = 'const s = "a//b"; for (let i = 0; i < 1; i++) {}';
    expect(normalizeSource(src, 'js')).toContain('for');
  });

  it('mengosongkan isi string, sehingga kata di dalamnya tidak terbaca sebagai kode', () => {
    expect(normalizeSource('const s = "function";', 'js')).not.toContain('function');
  });

  it('tidak tertipu tanda kutip di dalam komentar', () => {
    // Kutip tunggal yang tak berpasangan di komentar pernah membuat scanner naif menganggap
    // seluruh sisa berkas sebagai string.
    const src = "// jangan pakai function's\nfor (let i = 0; i < 1; i++) {}";
    expect(normalizeSource(src, 'js')).toContain('for');
    expect(normalizeSource(src, 'js')).not.toContain('function');
  });

  it('menghormati escape di dalam string', () => {
    const src = 'const s = "a\\"function\\"b"; for (const x of []) {}';
    expect(normalizeSource(src, 'js')).not.toContain('function');
    expect(normalizeSource(src, 'js')).toContain('for');
  });

  it('mengosongkan isi template literal tapi mempertahankan kode di dalam ${}', () => {
    const src = 'const t = `function ${items.map(String)}`;';
    const hasil = normalizeSource(src, 'js');
    expect(hasil).not.toContain('function');
    expect(hasil).toContain('items.map');
  });

  it('menangani template bersarang di dalam ${}', () => {
    const src = 'const t = `a ${`b ${c} d`} e`; for (;;) {}';
    const hasil = normalizeSource(src, 'js');
    expect(hasil).toContain('c');
    expect(hasil).toContain('for');
  });

  it('mempertahankan jumlah baris dan posisi kolom', () => {
    const src = 'let a = 1; // catatan\nlet b = 2;';
    const hasil = normalizeSource(src, 'js');
    expect(hasil).toHaveLength(src.length);
    expect(hasil.split('\n')).toHaveLength(2);
  });

  it('tidak menyatukan dua token saat komentar blok di antaranya dibuang', () => {
    // Menghapus (bukan mengosongkan) akan menghasilkan token palsu `ab`.
    expect(normalizeSource('a/* x */b', 'js')).toBe('a       b');
  });
});

describe('normalizeSource — PHP', () => {
  it('membuang komentar bergaya #', () => {
    expect(normalizeSource('# pakai Schema::create\n$a = 1;', 'php')).not.toContain('Schema');
  });

  it('tidak memperlakukan atribut #[…] sebagai komentar', () => {
    const src = '#[Attribute]\nclass Foo {}';
    expect(normalizeSource(src, 'php')).toContain('#[Attribute]');
  });

  it('mengosongkan isi heredoc', () => {
    const src = ['$sql = <<<SQL', 'SELECT * FROM users', 'SQL;', '$b = 2;'].join('\n');
    const hasil = normalizeSource(src, 'php');
    expect(hasil).not.toContain('SELECT');
    expect(hasil).toContain('$b = 2;');
  });

  it('mengosongkan isi nowdoc tapi mempertahankan kode sesudahnya', () => {
    const src = ["$t = <<<'TXT'", 'function palsu', 'TXT;', '$table->timestamps();'].join('\n');
    const hasil = normalizeSource(src, 'php');
    expect(hasil).not.toContain('function');
    expect(hasil).toContain('$table->timestamps();');
  });

  it('tidak memperlakukan backtick sebagai template literal di PHP', () => {
    // Di PHP backtick adalah operator shell_exec, bukan pembuka template.
    expect(normalizeSource('$a = 1; // x\n$b = 2;', 'php')).toContain('$b = 2;');
  });
});

describe('normalizeSource — CSS', () => {
  it('membuang komentar blok', () => {
    expect(normalizeSource('/* pakai flex */\n.kotak { color: red; }', 'css')).not.toContain(
      'flex',
    );
  });

  it('TIDAK menganggap // di dalam url() sebagai komentar', () => {
    // Jebakan yang nyata: // bukan komentar di CSS sama sekali, tapi ia muncul di setiap URL
    // absolut. Memperlakukannya sebagai komentar akan memakan sisa barisnya.
    const src = '.latar { background: url(https://contoh.id/a.png); display: flex; }';
    expect(normalizeSource(src, 'css')).toContain('display: flex');
  });

  it('TIDAK menganggap # sebagai komentar, karena itu selektor id', () => {
    const src = '#utama { display: grid; }';
    const hasil = normalizeSource(src, 'css');
    expect(hasil).toContain('#utama');
    expect(hasil).toContain('display: grid');
  });

  it('TIDAK memperlakukan backtick sebagai template literal', () => {
    // Backtick tidak punya arti di CSS. Memperlakukannya sebagai pembuka template akan
    // mengosongkan sisa berkas.
    const src = ".a::after { content: '`'; }\n.b { place-items: center; }";
    expect(normalizeSource(src, 'css')).toContain('place-items: center');
  });

  it('mempertahankan isi string saat diminta, karena nilai CSS hidup di sana', () => {
    const src = ".ikon::before { content: 'x'; }";
    expect(normalizeSource(src, 'css', { keepStrings: true })).toContain("'x'");
  });
});

describe('normalizeSource — SQL', () => {
  it('membuang komentar baris bergaya --', () => {
    expect(normalizeSource('-- pakai JOIN\nSELECT 1;', 'sql')).not.toContain('JOIN');
  });

  it('membuang komentar blok', () => {
    expect(normalizeSource('/* WHERE id = 1 */ SELECT 1;', 'sql')).not.toContain('WHERE');
  });

  it('TIDAK menganggap -- di dalam string sebagai komentar', () => {
    const src = "SELECT 'a--b' AS x FROM pesanan WHERE id = 1;";
    expect(normalizeSource(src, 'sql', { keepStrings: true })).toContain('WHERE id = 1');
  });

  it('TIDAK menganggap # sebagai komentar, dan // di dalam string tetap aman', () => {
    // Di PostgreSQL keduanya bukan komentar. `#` bahkan operator XOR bit.
    const src = "SELECT 'https://contoh.id' AS url, 5 # 3 AS x FROM pesanan;";
    expect(normalizeSource(src, 'sql')).toContain('FROM pesanan');
  });

  it("menangani tanda kutip yang digandakan ('') di dalam string", () => {
    const src = "SELECT 'it''s' AS x FROM pengguna WHERE aktif;";
    expect(normalizeSource(src, 'sql', { keepStrings: true })).toContain('WHERE aktif');
  });
});

describe('normalizeSource — keepStrings pada template literal', () => {
  it('mempertahankan isi template literal saat keepStrings aktif', () => {
    // Query SQL di kode Node sering ditulis sebagai template literal. Pemeriksa struktural
    // harus bisa melihat placeholder $1 di dalamnya, dan juga ${...} yang berbahaya.
    const src = 'db.query(`SELECT id FROM pengguna WHERE email = $1`, [email]);';
    expect(normalizeSource(src, 'js', { keepStrings: true })).toContain('email = $1');
  });

  it('mempertahankan ${...} saat keepStrings aktif, supaya interpolasi bisa dideteksi', () => {
    const src = "db.query(`SELECT id FROM pengguna WHERE email = '${email}'`);";
    expect(normalizeSource(src, 'js', { keepStrings: true })).toContain('${email}');
  });

  it('tetap mengosongkan isi template literal secara bawaan', () => {
    const src = 'const t = `function`; for (;;) {}';
    expect(normalizeSource(src, 'js')).not.toContain('function');
  });
});
