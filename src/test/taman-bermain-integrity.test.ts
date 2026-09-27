import { describe, expect, it } from 'vitest';
import { getCurriculum } from '@/lib/curriculum/queries';
import { getExerciseBank } from '@/content/taman-bermain';
import { checkConstraints, checkStructure } from '@/lib/taman-bermain/check';
import { grade } from '@/lib/taman-bermain/grade';
import { createVmRunner } from '@/lib/taman-bermain/runner-vm';
import { CODE_LANGUAGES } from '@/lib/content/types';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * The guard that makes the whole feature trustworthy.
 *
 * An exercise whose grader is wrong is worse than no exercise: it teaches the wrong thing and it
 * destroys the learner's trust in every other exercise at the same time. Leaving that to the care
 * of whoever wrote the exercise is waiting for them to slip — the same reasoning that produced
 * `curriculum-integrity.test.ts`, which exists because editing prose passes every other check.
 *
 * So the real grader is run here, in Node, against three things per exercise:
 *
 *   - the official answer, which MUST pass
 *   - every listed alternative, which MUST also pass — this is "many ways to be right", made
 *     mechanical instead of aspirational
 *   - every rejected answer, which MUST fail — this is what proves the grader actually bites
 *
 * That triple is the entire reason `grade()` takes an injected runner (SDD §2.1). A grader welded
 * to `Worker` could not be called from here at all.
 */

const BANK = getExerciseBank();

async function nilai(exercise: Exercise, code: string) {
  const runner = createVmRunner();
  try {
    return await grade(exercise.check, code, runner);
  } finally {
    runner.dispose();
  }
}

function ringkas(hasil: Awaited<ReturnType<typeof nilai>>): string {
  const aturan = hasil.constraints
    .filter((row) => !row.passed)
    .map((row) => `aturan "${row.label}": ${row.detail ?? 'gagal'}`);
  const skenario = hasil.scenarios
    .filter((row) => !row.passed)
    .map(
      (row) =>
        `skenario "${row.name}": diharapkan ${row.expectedDisplay}, didapat ${row.actualDisplay}`,
    );
  const catatan = hasil.message === undefined ? [] : [hasil.message];
  return [...aturan, ...skenario, ...catatan].join(' | ') || 'tidak ada rincian';
}

describe('bank soal — bentuk', () => {
  it('tidak kosong', () => {
    expect(BANK.length).toBeGreaterThan(0);
  });

  it('slug unik secara global', () => {
    const slugs = BANK.map((exercise) => exercise.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slug aman dipakai sebagai URL dan kunci penyimpanan', () => {
    for (const exercise of BANK) {
      expect(exercise.slug, `${exercise.slug} bukan slug kebab-case`).toMatch(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
      );
    }
  });

  it('setiap soal menunjuk bab kurikulum yang benar-benar ada', () => {
    const kurikulum = getCurriculum();
    for (const exercise of BANK) {
      const kategori = kurikulum.find((c) => c.slug === exercise.source.category);
      expect(
        kategori,
        `${exercise.slug}: kategori ${exercise.source.category} tidak ada`,
      ).toBeDefined();
      const bab = kategori?.chapters.find((c) => c.slug === exercise.source.chapter);
      expect(bab, `${exercise.slug}: bab ${exercise.source.chapter} tidak ada`).toBeDefined();
    }
  });

  it('setiap soal menyebut pemakaian nyatanya, dan bukan sekadar mengulang judul', () => {
    // FR-TB-16. Ini penegak kriteria pemilihan soal: penulis yang tidak bisa menyebut kapan
    // sebuah logika dipakai belum membuktikan soalnya layak ada (PRD §2.5).
    for (const exercise of BANK) {
      expect(
        exercise.realWorldUse.length,
        `${exercise.slug}: realWorldUse terlalu pendek`,
      ).toBeGreaterThan(30);
      expect(
        exercise.realWorldUse.toLowerCase().trim(),
        `${exercise.slug}: realWorldUse cuma mengulang judul`,
      ).not.toBe(exercise.title.toLowerCase().trim());
    }
  });

  it('setiap soal punya tingkat yang sah', () => {
    for (const exercise of BANK) {
      expect(['basic', 'intermediate']).toContain(exercise.level);
    }
  });

  it('setiap soal punya penjelasan, petunjuk, dan pernyataan soal yang terisi', () => {
    for (const exercise of BANK) {
      expect(exercise.brief.tasks.length, `${exercise.slug}: tanpa tugas`).toBeGreaterThan(0);
      expect(exercise.hints.length, `${exercise.slug}: tanpa petunjuk`).toBeGreaterThan(0);
      expect(exercise.hints.every((h) => h.trim().length > 0)).toBe(true);
      expect(
        exercise.solution.explanation.trim().length,
        `${exercise.slug}: kunci jawaban tanpa penjelasan`,
      ).toBeGreaterThan(0);
      expect(exercise.starter.trim().length, `${exercise.slug}: starter kosong`).toBeGreaterThan(0);
    }
  });

  it('setiap aturan yang ditampilkan punya penegak di mesin penilai', () => {
    // Pemeriksaan kasar dengan sengaja: mesin tidak bisa membaca kalimat aturan dan mencocokkannya
    // ke sebuah pola. Yang bisa ia tangkap adalah kasus yang paling sering terjadi — soal yang
    // menjanjikan lima aturan ke pembelajar lalu hanya menegakkan satu.
    for (const exercise of BANK) {
      const penegak =
        exercise.check.engine === 'js'
          ? exercise.check.constraints.length + exercise.check.scenarios.length
          : exercise.check.assertions.length;
      expect(
        penegak,
        `${exercise.slug}: ${exercise.rules.length} aturan, ${penegak} penegak`,
      ).toBeGreaterThanOrEqual(exercise.rules.length);
    }
  });

  it('setiap alasan penolakan terisi', () => {
    for (const exercise of BANK) {
      expect(
        exercise.rejectedSolutions.length,
        `${exercise.slug}: tanpa rejectedSolutions`,
      ).toBeGreaterThan(0);
      for (const ditolak of exercise.rejectedSolutions) {
        expect(
          ditolak.reason.trim().length,
          `${exercise.slug}: alasan penolakan kosong`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('setiap soal punya minimal satu cara lain yang harus lolos', () => {
    for (const exercise of BANK) {
      expect(
        exercise.alternativeSolutions.length,
        `${exercise.slug}: tanpa alternativeSolutions, penilainya belum terbukti menerima cara lain`,
      ).toBeGreaterThan(0);
    }
  });

  it('setiap pola regex bisa dikompilasi', () => {
    for (const exercise of BANK) {
      const pola =
        exercise.check.engine === 'js'
          ? exercise.check.constraints.flatMap((c) =>
              c.rule.type === 'maks-baris' ? [] : [c.rule.pattern],
            )
          : exercise.check.assertions.flatMap((a) =>
              a.rule.type === 'berurutan' ? a.rule.patterns : [a.rule.pattern],
            );
      for (const p of pola) {
        expect(
          () => new RegExp(p),
          `${exercise.slug}: pola "${p}" tidak bisa dikompilasi`,
        ).not.toThrow();
      }
    }
  });

  it('soal bermasukan-berubah punya minimal dua skenario dan minimal satu tersembunyi', () => {
    // Aturan ini sengaja bersyarat, bukan seragam.
    //
    // Soal yang memanggil fungsi pembelajar dengan masukan berbeda BISA disetel ke contoh yang
    // tercetak, jadi ia butuh kasus tersembunyi. Soal yang cuma mencetak keluaran tetap tidak
    // punya masukan untuk divariasikan — keluaran yang diharapkan ITULAH soalnya, dan di sana
    // yang bekerja adalah lapis batasan. Memaksakan skenario kedua di situ hanya akan
    // melahirkan skenario karangan, yang lebih buruk daripada tidak ada.
    for (const exercise of BANK) {
      if (exercise.check.engine !== 'js') continue;
      const { scenarios, constraints } = exercise.check;

      const bermasukan = scenarios.some((s) => s.expect.type === 'nilai');
      if (bermasukan) {
        expect(scenarios.length, `${exercise.slug}: cuma satu skenario`).toBeGreaterThanOrEqual(2);
        expect(
          scenarios.some((s) => !s.visible),
          `${exercise.slug}: semua skenarionya tampak, tidak ada yang tersembunyi`,
        ).toBe(true);
      } else {
        expect(scenarios.length, `${exercise.slug}: tanpa skenario`).toBeGreaterThanOrEqual(1);
        expect(
          constraints.length,
          `${exercise.slug}: keluaran tetap tanpa batasan — tidak ada yang benar-benar diuji`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('soal mesin struktur selalu menyertakan hint di tiap asersinya', () => {
    for (const exercise of BANK) {
      if (exercise.check.engine !== 'struktur') continue;
      // Tanpa eksekusi tidak ada "diharapkan vs didapat" untuk ditampilkan, jadi hint adalah
      // satu-satunya yang berdiri antara pembelajar dan kata "salah" (SDD §4.5).
      for (const asersi of exercise.check.assertions) {
        expect(
          asersi.hint.trim().length,
          `${exercise.slug}/${asersi.id}: hint kosong`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

/**
 * Every string a learner reads, labelled by where it comes from, so a failure names the field.
 *
 * Term NAMES are excluded on purpose: they are code-like labels rendered in monospace (`useRef`,
 * `N+1 query`), not prose. Their meanings are included.
 */
function teksPembelajar(e: Exercise): { bidang: string; teks: string }[] {
  const out: { bidang: string; teks: string }[] = [
    { bidang: 'title', teks: e.title },
    { bidang: 'realWorldUse', teks: e.realWorldUse },
    { bidang: 'brief.situation', teks: e.brief.situation },
    ...e.brief.tasks.map((teks) => ({ bidang: 'brief.tasks', teks })),
    ...e.brief.pitfalls.map((teks) => ({ bidang: 'brief.pitfalls', teks })),
    ...e.brief.terms.map((t) => ({ bidang: `brief.terms[${t.term}]`, teks: t.meaning })),
    ...e.rules.map((teks) => ({ bidang: 'rules', teks })),
    ...e.hints.map((teks) => ({ bidang: 'hints', teks })),
    ...e.solution.steps.map((teks) => ({ bidang: 'solution.steps', teks })),
    { bidang: 'solution.explanation', teks: e.solution.explanation },
    ...e.rejectedSolutions.map((r) => ({ bidang: 'rejectedSolutions.reason', teks: r.reason })),
  ];
  if (e.check.engine === 'js') {
    out.push(...e.check.constraints.map((c) => ({ bidang: 'constraint.label', teks: c.label })));
    out.push(...e.check.scenarios.map((sc) => ({ bidang: 'scenario.name', teks: sc.name })));
  } else {
    out.push(...e.check.assertions.map((a) => ({ bidang: 'assertion.label', teks: a.label })));
    out.push(...e.check.assertions.map((a) => ({ bidang: 'assertion.hint', teks: a.hint })));
  }
  return out;
}

/** Prose only: code spans and fenced blocks are exempt from every style rule. */
function prosa(teks: string): string {
  return teks.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
}

describe('bank soal — soal yang jelas untuk pemula', () => {
  it('setiap soal dibuka dengan situasi nyata, bukan definisi', () => {
    for (const e of BANK) {
      expect(
        e.brief.situation.trim().length,
        `${e.slug}: situation terlalu pendek`,
      ).toBeGreaterThan(80);
    }
  });

  it('setiap soal menyebut tugasnya sebagai butir yang bisa dicentang', () => {
    for (const e of BANK) {
      expect(e.brief.tasks.length, `${e.slug}: tanpa tasks`).toBeGreaterThan(0);
      for (const t of e.brief.tasks)
        expect(t.trim().length, `${e.slug}: task kosong`).toBeGreaterThan(10);
    }
  });

  it('setiap soal menyebut minimal satu hal yang sering terlewat', () => {
    for (const e of BANK) {
      expect(e.brief.pitfalls.length, `${e.slug}: tanpa pitfalls`).toBeGreaterThan(0);
    }
  });

  it('setiap istilah dijelaskan tuntas, bukan satu baris definisi', () => {
    // materi-jangan-singkat: pemula belum punya konteks untuk ditempeli definisi satu baris.
    for (const e of BANK) {
      expect(e.brief.terms.length, `${e.slug}: tanpa istilah`).toBeGreaterThan(0);
      const nama = e.brief.terms.map((t) => t.term);
      expect(new Set(nama).size, `${e.slug}: istilah dobel`).toBe(nama.length);
      for (const t of e.brief.terms) {
        expect(t.meaning.length, `${e.slug}/${t.term}: penjelasan terlalu pendek`).toBeGreaterThan(
          90,
        );
      }
    }
  });

  it('kode yang diberikan menyebut nama berkasnya dan bahasanya dikenali', () => {
    for (const e of BANK) {
      const g = e.brief.given;
      if (!g) continue;
      expect(g.file, `${e.slug}: given tanpa nama berkas`).toMatch(/\.\w+$/);
      expect(CODE_LANGUAGES as readonly string[]).toContain(g.lang);
      expect(g.code.trim().length).toBeGreaterThan(0);
    }
  });

  it('bahasa sorotan kunci jawaban dikenali', () => {
    for (const e of BANK) {
      if (e.codeLang === undefined) continue;
      expect(CODE_LANGUAGES as readonly string[], e.slug).toContain(e.codeLang);
    }
  });
});

describe('bank soal — kunci jawaban yang bisa dipelajari', () => {
  it('setiap kunci jawaban dijelaskan langkah demi langkah', () => {
    for (const e of BANK) {
      expect(e.solution.steps.length, `${e.slug}: kurang dari dua langkah`).toBeGreaterThanOrEqual(
        2,
      );
      for (const l of e.solution.steps)
        expect(l.trim().length, `${e.slug}: langkah kosong`).toBeGreaterThan(20);
    }
  });

  it('setiap alasan penolakan cukup jelas untuk ditampilkan sebagai kesalahan umum', () => {
    for (const e of BANK) {
      for (const r of e.rejectedSolutions) {
        expect(r.reason.length, `${e.slug}: alasan penolakan terlalu pendek`).toBeGreaterThan(30);
      }
    }
  });
});

describe('bank soal — gaya bahasa (memori prosa-tanda-baca-minim & istilah-inggris)', () => {
  it('nol tanda pisah, titik koma, dan titik dua di prosa', () => {
    // Satu kalimat, satu gagasan. Di dalam `code` semuanya bebas — aturan ini tentang prosa.
    const langgar: string[] = [];
    for (const e of BANK) {
      for (const { bidang, teks } of teksPembelajar(e)) {
        const p = prosa(teks);
        if (/[—–]|;|:(?!\d)/.test(p)) langgar.push(`${e.slug} · ${bidang} · ${teks.slice(0, 70)}`);
      }
    }
    expect(
      langgar,
      `${langgar.length} string melanggar:\n${langgar.slice(0, 25).join('\n')}`,
    ).toEqual([]);
  });

  it('tidak memakai calque yang sudah diputuskan diganti bahasa Inggris', () => {
    // Keputusannya tercatat di plans/revisi-soal-taman-bermain/planning.md §3.3, lengkap dengan
    // hitungan pemakaiannya di kurikulum.
    const calque: [RegExp, string][] = [
      [/\bperulangan\b/i, 'pakai `loop`'],
      [/\b(cincin|penanda) fokus\b/i, 'pakai `focus ring`'],
      [/\bber-?kunci\b/i, 'tulis "objek dengan `key` berupa …"'],
      [/\bwadah\w*/i, 'pakai `container`'],
    ];
    const langgar: string[] = [];
    for (const e of BANK) {
      for (const { bidang, teks } of teksPembelajar(e)) {
        for (const [pola, saran] of calque) {
          if (pola.test(prosa(teks))) langgar.push(`${e.slug} · ${bidang} · ${saran}`);
        }
      }
    }
    expect(langgar, langgar.join('\n')).toEqual([]);
  });
});

describe('bank soal — jumlah dan komposisi (ratchet)', () => {
  /**
   * Pola *ratchet*, sama seperti `curriculum-integrity.test.ts`: angkanya boleh naik, tidak boleh
   * turun. Jumlah yang hanya hidup di dokumen akan menyimpang dari isi repo dalam hitungan minggu;
   * jumlah yang dijaga test tidak bisa.
   *
   * Yang dijaga bukan cuma totalnya. Mayoritas soal harus tetap dinilai dengan EKSEKUSI, bukan
   * analisis bentuk — mesin `struktur` memberi kepastian yang lebih rendah (PRD §7 R-3), dan bank
   * yang perlahan condong ke sana akan terasa lebih meyakinkan daripada kenyataannya.
   */
  const hitung = (level: string, engine: string): number =>
    BANK.filter((e) => e.level === level && e.check.engine === engine).length;

  it('memuat 71 soal', () => {
    expect(BANK.length).toBeGreaterThanOrEqual(71);
  });

  it('soal yang dijalankan: minimal 17 Basic dan 19 Intermediate', () => {
    expect(hitung('basic', 'js')).toBeGreaterThanOrEqual(17);
    expect(hitung('intermediate', 'js')).toBeGreaterThanOrEqual(19);
  });

  it('soal yang diperiksa strukturnya: minimal 16 Basic dan 19 Intermediate', () => {
    expect(hitung('basic', 'struktur')).toBeGreaterThanOrEqual(16);
    expect(hitung('intermediate', 'struktur')).toBeGreaterThanOrEqual(19);
  });

  it('MAYORITAS soal dinilai dengan eksekusi sungguhan, bukan analisis bentuk', () => {
    const dijalankan = BANK.filter((e) => e.check.engine === 'js').length;
    expect(dijalankan).toBeGreaterThan(BANK.length / 2);
  });

  it('mencakup keempat bahasa yang dikenali pemeriksa struktural', () => {
    // js untuk JSX dan Node, php untuk Laravel, css untuk konfigurasi Tailwind v4, sql untuk query
    // PostgreSQL. Kalau salah satunya hilang, dukungan bahasanya jadi kode yang tidak dipakai
    // siapa pun.
    const bahasa = new Set(
      BANK.flatMap((e) => (e.check.engine === 'struktur' ? [e.check.bahasa] : [])),
    );
    expect([...bahasa].sort()).toEqual(['css', 'js', 'php', 'sql']);
  });

  it('setiap topik punya minimal satu soal', () => {
    const topik = new Set(BANK.map((e) => e.topic));
    expect(topik.size).toBeGreaterThanOrEqual(11);
  });
});

describe('bank soal — pola pemeriksaan tidak membekukan tab', () => {
  /**
   * Structural checks run on the main thread, so a slow pattern freezes the learner's tab.
   * Chained lazy scans such as `select[\s\S]*?nama[\s\S]*?from` backtrack quadratically when
   * the text never reaches the last token: the first SQL patterns took eleven seconds on 20,000
   * characters of `select nama `. The hostile inputs are built from each exercise's own answer
   * key, so a new exercise is covered without anyone maintaining a list.
   */
  const PANJANG = 20_000; // the same cap as MAX_DRAFT_CHARS
  const BATAS_MS = 500; // the slow patterns took 1,300–11,000 ms; the linear ones stay under 50

  const ulang = (s: string): string =>
    s.length === 0 ? '' : s.repeat(Math.ceil(PANJANG / s.length)).slice(0, PANJANG);

  /**
   * Every prefix of the answer key, repeated. What makes a pattern slow is a combination of
   * tokens that never completes — `select nama` with no `from`, a `left join … where` with no
   * `is null` — and a prefix of a correct answer is exactly such a combination. Comments are
   * stripped first, or a `--` in the prefix would blank the rest of the input and hide the case.
   */
  function masukanJahat(kode: string): string[] {
    const token = kode
      .replace(/(--|\/\/).*$/gm, '')
      .split(/\s+/)
      .filter(Boolean);
    return [
      ...token.map((_, i) => ulang(`${token.slice(0, i + 1).join(' ')} `)),
      ulang("'"),
      ulang('"'),
    ];
  }

  it.each(BANK.map((e) => [e.slug, e] as const))('%s', (_slug, exercise) => {
    const { check } = exercise;
    for (const masukan of masukanJahat(exercise.solution.code)) {
      const mulai = performance.now();
      if (check.engine === 'struktur') checkStructure(masukan, check.assertions, check.bahasa);
      else checkConstraints(masukan, check.constraints, 'js');
      const lama = performance.now() - mulai;
      expect(lama, `${JSON.stringify(masukan.slice(0, 24))}… ${lama.toFixed(0)} ms`).toBeLessThan(
        BATAS_MS,
      );
    }
  });
});

describe('bank soal — kunci jawaban diuji penilainya sendiri', () => {
  for (const exercise of BANK) {
    describe(exercise.slug, () => {
      it('kunci jawaban resmi LOLOS', async () => {
        const hasil = await nilai(exercise, exercise.solution.code);
        expect(hasil.passed, `kunci jawaban ditolak penilainya sendiri — ${ringkas(hasil)}`).toBe(
          true,
        );
      });

      exercise.alternativeSolutions.forEach((kode, index) => {
        it(`cara lain #${index + 1} LOLOS`, async () => {
          const hasil = await nilai(exercise, kode);
          expect(hasil.passed, `cara lain yang benar ditolak — ${ringkas(hasil)}`).toBe(true);
        });
      });

      exercise.rejectedSolutions.forEach((ditolak, index) => {
        it(`yang harus ditolak #${index + 1} GAGAL — ${ditolak.reason}`, async () => {
          const hasil = await nilai(exercise, ditolak.code);
          expect(hasil.passed, 'penilai menerima jawaban yang seharusnya ditolak').toBe(false);
        });
      });
    });
  }
});
