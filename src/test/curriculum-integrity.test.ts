import { describe, expect, it } from 'vitest';
import { cheatsheets } from '@/content/cheatsheets';
import { glossary } from '@/content/glossary';
import { CODE_LANGUAGES, OFFICIAL_DOC_HOSTS, type Block } from '@/lib/content/types';
import { flattenLessons, getCurriculum } from '@/lib/curriculum/queries';
import { lessonKey } from '@/lib/curriculum/types';

/**
 * Structural rules for the curriculum, checked against the real data rather than a fixture.
 *
 * These are the six rules from SRS §4. They exist because 330 hand-written lessons will
 * eventually grow a duplicate slug, a numbering gap, or a link to something that was renamed —
 * and none of those are things a person reliably catches by reading.
 */

const curriculum = getCurriculum();
const allLessons = flattenLessons();
const validLessonKeys = new Set(allLessons.map((location) => location.key));
const validChapterKeys = new Set(
  curriculum.flatMap((category) =>
    category.chapters.map((chapter) => `${category.slug}/${chapter.slug}`),
  ),
);

function collectBlocks(): { block: Block; where: string }[] {
  const result: { block: Block; where: string }[] = [];
  for (const location of allLessons) {
    if (location.lesson.status !== 'written') continue;
    for (const block of location.lesson.blocks) {
      result.push({ block, where: location.key });
    }
  }
  return result;
}

describe('bentuk kurikulum', () => {
  it('punya lima kategori dengan urutan 1..5 tanpa lompatan', () => {
    expect(curriculum).toHaveLength(5);
    expect(curriculum.map((category) => category.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it('slug kategori unik', () => {
    const slugs = curriculum.map((category) => category.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('setiap kategori punya minimal satu bab, dan setiap bab minimal satu sub-bab', () => {
    for (const category of curriculum) {
      expect(category.chapters.length, `kategori ${category.slug}`).toBeGreaterThan(0);
      for (const chapter of category.chapters) {
        expect(chapter.lessons.length, `bab ${category.slug}/${chapter.slug}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('aturan integritas (SRS §4)', () => {
  it('1. slug bab unik dalam kategorinya, slug sub-bab unik dalam babnya', () => {
    for (const category of curriculum) {
      const chapterSlugs = category.chapters.map((chapter) => chapter.slug);
      expect(new Set(chapterSlugs).size, `bab duplikat di ${category.slug}`).toBe(
        chapterSlugs.length,
      );

      for (const chapter of category.chapters) {
        const lessonSlugs = chapter.lessons.map((lesson) => lesson.slug);
        expect(
          new Set(lessonSlugs).size,
          `sub-bab duplikat di ${category.slug}/${chapter.slug}`,
        ).toBe(lessonSlugs.length);
      }
    }
  });

  it('2. nomor bab dan sub-bab membentuk deret 1..n tanpa lompatan', () => {
    for (const category of curriculum) {
      expect(
        category.chapters.map((chapter) => chapter.number),
        `nomor bab ${category.slug}`,
      ).toEqual(category.chapters.map((_, index) => index + 1));

      for (const chapter of category.chapters) {
        expect(
          chapter.lessons.map((lesson) => lesson.index),
          `nomor sub-bab ${category.slug}/${chapter.slug}`,
        ).toEqual(chapter.lessons.map((_, index) => index + 1));
      }
    }
  });

  it('3. setiap prasyarat menunjuk bab yang benar-benar ada', () => {
    for (const category of curriculum) {
      for (const chapter of category.chapters) {
        for (const prerequisite of chapter.prerequisites) {
          const key = `${prerequisite.category}/${prerequisite.chapter}`;
          expect(
            validChapterKeys.has(key),
            `prasyarat mati "${key}" di ${category.slug}/${chapter.slug}`,
          ).toBe(true);
        }
      }
    }
  });

  it('4. setiap tautan internal di materi menunjuk rute yang ada', () => {
    const internalLink = /\[[^\]]+\]\((\/[^)\s]+)\)/g;

    for (const { block, where } of collectBlocks()) {
      const texts: string[] = [];
      if (block.kind === 'paragraph') texts.push(block.text);
      if (block.kind === 'list') texts.push(...block.items);
      if (block.kind === 'callout') texts.push(...block.body);
      if (block.kind === 'table') texts.push(...block.head, ...block.rows.flat());

      for (const text of texts) {
        for (const match of text.matchAll(internalLink)) {
          const href = match[1];
          if (href === undefined || !href.startsWith('/kelas/')) continue;
          const parts = href.replace(/^\/kelas\//, '').split('/');
          expect(
            validLessonKeys.has(parts.join('/')) || validChapterKeys.has(parts.join('/')),
            `tautan mati "${href}" di ${where}`,
          ).toBe(true);
        }
      }
    }
  });

  it('5. setiap soal kuis punya indeks jawaban yang valid dan penjelasan', () => {
    const seenIds = new Set<string>();

    for (const category of curriculum) {
      for (const chapter of category.chapters) {
        const inline = chapter.lessons
          .filter((lesson) => lesson.status === 'written')
          .flatMap((lesson) =>
            lesson.status === 'written'
              ? lesson.blocks.filter((block) => block.kind === 'quiz')
              : [],
          )
          .flatMap((block) => (block.kind === 'quiz' ? block.questions : []));

        for (const question of [...(chapter.quiz ?? []), ...inline]) {
          const where = `${category.slug}/${chapter.slug} soal ${question.id}`;

          expect(seenIds.has(question.id), `id kuis duplikat: ${question.id}`).toBe(false);
          seenIds.add(question.id);

          expect(question.options.length, `${where}: opsi terlalu sedikit`).toBeGreaterThanOrEqual(
            2,
          );
          expect(question.answerIndex, `${where}: answerIndex negatif`).toBeGreaterThanOrEqual(0);
          expect(question.answerIndex, `${where}: answerIndex di luar jangkauan`).toBeLessThan(
            question.options.length,
          );
          expect(question.explanation.trim().length, `${where}: penjelasan kosong`).toBeGreaterThan(
            0,
          );
        }
      }
    }
  });

  it('6. setiap istilah glosarium yang menunjuk sub-bab menunjuk sub-bab yang ada', () => {
    for (const entry of glossary) {
      if (!entry.lesson) continue;
      expect(
        validLessonKeys.has(entry.lesson),
        `glosarium "${entry.term}" menunjuk sub-bab mati`,
      ).toBe(true);
    }
  });
});

describe('aturan konten', () => {
  it('hanya memakai bahasa yang ada di allow-list highlighter', () => {
    const allowed = new Set<string>(CODE_LANGUAGES);

    for (const { block, where } of collectBlocks()) {
      if (block.kind === 'code') {
        expect(allowed.has(block.lang), `bahasa "${block.lang}" tidak diizinkan di ${where}`).toBe(
          true,
        );
      }
      if (block.kind === 'compare') {
        expect(allowed.has(block.left.lang), `bahasa kiri di ${where}`).toBe(true);
        expect(allowed.has(block.right.lang), `bahasa kanan di ${where}`).toBe(true);
      }
    }

    for (const sheet of cheatsheets) {
      for (const section of sheet.sections) {
        expect(allowed.has(section.lang), `bahasa cheatsheet ${sheet.slug}/${section.title}`).toBe(
          true,
        );
      }
    }
  });

  it('sub-bab berstatus outline selalu punya minimal satu poin garis besar', () => {
    for (const location of allLessons) {
      if (location.lesson.status !== 'outline') continue;
      expect(
        location.lesson.outline.length,
        `${location.key} outline kosong — halaman akan tampak kosong`,
      ).toBeGreaterThan(0);
    }
  });

  /**
   * The on-page table of contents links to `#<heading-id>`. Two headings deriving the same id
   * inside one lesson would send both entries to the same place and break the active-section
   * marker — a failure that is invisible until someone clicks.
   */
  it('id heading tidak pernah duplikat di dalam satu sub-bab', () => {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    for (const location of allLessons) {
      if (location.lesson.status !== 'written') continue;

      const ids = location.lesson.blocks
        .filter((block) => block.kind === 'heading')
        .map((block) => (block.kind === 'heading' ? (block.id ?? slugify(block.text)) : ''));

      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      expect(
        duplicates,
        `id heading duplikat di ${location.key}: ${duplicates.join(', ')}`,
      ).toEqual([]);
    }
  });

  /** A heading whose text is all punctuation would produce an empty, unlinkable anchor. */
  it('setiap heading menghasilkan id yang tidak kosong', () => {
    for (const location of allLessons) {
      if (location.lesson.status !== 'written') continue;

      for (const block of location.lesson.blocks) {
        if (block.kind !== 'heading') continue;
        const id =
          block.id ??
          block.text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        expect(
          id.length,
          `heading "${block.text}" di ${location.key} menghasilkan id kosong`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('sub-bab berstatus written selalu punya blok', () => {
    for (const location of allLessons) {
      if (location.lesson.status !== 'written') continue;
      expect(location.lesson.blocks.length, `${location.key} tanpa blok`).toBeGreaterThan(0);
    }
  });

  it('setiap sub-bab punya judul, ringkasan, dan estimasi menit yang wajar', () => {
    for (const location of allLessons) {
      expect(location.lesson.title.trim().length, `${location.key} judul kosong`).toBeGreaterThan(
        0,
      );
      expect(
        location.lesson.summary.trim().length,
        `${location.key} ringkasan kosong`,
      ).toBeGreaterThan(0);
      expect(location.lesson.minutes, `${location.key} menit tidak wajar`).toBeGreaterThan(0);
      expect(location.lesson.minutes, `${location.key} menit tidak wajar`).toBeLessThanOrEqual(60);
    }
  });

  it('setiap bab mencantumkan versi rujukan dan tanggal tinjauan yang valid', () => {
    for (const category of curriculum) {
      for (const chapter of category.chapters) {
        const where = `${category.slug}/${chapter.slug}`;
        expect(chapter.stackVersions.length, `${where} tanpa versi rujukan`).toBeGreaterThan(0);
        expect(
          Number.isNaN(new Date(chapter.reviewedAt).getTime()),
          `${where} tanggal tinjauan tidak valid`,
        ).toBe(false);
        expect(chapter.objectives.length, `${where} tanpa tujuan belajar`).toBeGreaterThan(0);
      }
    }
  });

  it('kunci sub-bab yang dihasilkan unik secara global', () => {
    const keys = allLessons.map((location) =>
      lessonKey(location.category.slug, location.chapter.slug, location.lesson.slug),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});

/**
 * Guards the two blocks added in ADR-0006.
 *
 * The material claims to point at official documentation. Without a machine check that claim
 * decays quietly: one link to a blog, then a dead vendor URL, then a "reference" that is really a
 * tutorial. The allow-list is the enforcement point, not the author's memory.
 */
describe('istilah & rujukan resmi (ADR-0006)', () => {
  const allowedHosts = new Set<string>(OFFICIAL_DOC_HOSTS);

  /** Lessons that carry at least one block of the given kind. */
  function lessonsWithBlock(kind: 'terms' | 'references'): Set<string> {
    const keys = new Set<string>();
    for (const location of allLessons) {
      if (location.lesson.status !== 'written') continue;
      if (location.lesson.blocks.some((block) => block.kind === kind)) keys.add(location.key);
    }
    return keys;
  }

  it('setiap rujukan memakai https dan host dokumentasi resmi yang diizinkan', () => {
    for (const { block, where } of collectBlocks()) {
      if (block.kind !== 'references') continue;

      expect(block.items.length, `${where}: blok rujukan kosong`).toBeGreaterThan(0);

      for (const item of block.items) {
        expect(item.label.trim().length, `${where}: rujukan tanpa judul`).toBeGreaterThan(0);
        expect(
          item.source.trim().length,
          `${where}: rujukan "${item.label}" tanpa nama sumber`,
        ).toBeGreaterThan(0);

        let url: URL;
        try {
          url = new URL(item.href);
        } catch {
          throw new Error(`${where}: rujukan "${item.label}" bukan URL absolut: ${item.href}`);
        }

        expect(url.protocol, `${where}: rujukan "${item.label}" tidak memakai https`).toBe(
          'https:',
        );
        expect(
          allowedHosts.has(url.hostname),
          `${where}: host "${url.hostname}" bukan dokumentasi resmi yang diizinkan — tambahkan ke OFFICIAL_DOC_HOSTS kalau memang resmi`,
        ).toBe(true);
      }
    }
  });

  it('tidak ada rujukan yang sama dua kali dalam satu sub-bab', () => {
    for (const location of allLessons) {
      if (location.lesson.status !== 'written') continue;

      const hrefs = location.lesson.blocks
        .filter((block) => block.kind === 'references')
        .flatMap((block) => (block.kind === 'references' ? block.items.map((i) => i.href) : []));

      const duplicates = hrefs.filter((href, index) => hrefs.indexOf(href) !== index);
      expect(duplicates, `rujukan duplikat di ${location.key}: ${duplicates.join(', ')}`).toEqual(
        [],
      );
    }
  });

  it('setiap istilah punya nama dan arti, tanpa duplikat dalam satu sub-bab', () => {
    for (const location of allLessons) {
      if (location.lesson.status !== 'written') continue;

      const entries = location.lesson.blocks
        .filter((block) => block.kind === 'terms')
        .flatMap((block) => (block.kind === 'terms' ? block.items : []));

      for (const entry of entries) {
        expect(entry.term.trim().length, `${location.key}: istilah tanpa nama`).toBeGreaterThan(0);
        expect(
          entry.meaning.trim().length,
          `${location.key}: istilah "${entry.term}" tanpa arti`,
        ).toBeGreaterThan(0);
      }

      const names = entries.map((entry) => entry.term);
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      expect(duplicates, `istilah duplikat di ${location.key}: ${duplicates.join(', ')}`).toEqual(
        [],
      );
    }
  });

  it('bab yang sudah direvisi punya blok istilah dan rujukan di setiap sub-babnya', () => {
    // Tambahkan bab ke daftar ini setiap kali revisinya selesai. Menghapus entri = regresi.
    const babSudahDirevisi = [
      'frontend-basic/javascript-dari-nol',
      'frontend-basic/oop-javascript',
      'frontend-basic/asynchronous-javascript',
      'frontend-basic/manipulasi-dom',
      'frontend-basic/ajax-web-api',
    ];

    const denganTerms = lessonsWithBlock('terms');
    const denganReferences = lessonsWithBlock('references');

    for (const babKey of babSudahDirevisi) {
      const [categorySlug, chapterSlug] = babKey.split('/');
      const chapter = curriculum
        .find((category) => category.slug === categorySlug)
        ?.chapters.find((c) => c.slug === chapterSlug);

      expect(chapter, `bab "${babKey}" tidak ditemukan`).toBeDefined();

      for (const lesson of chapter?.lessons ?? []) {
        const key = `${babKey}/${lesson.slug}`;
        expect(denganTerms.has(key), `${key} belum punya blok istilah`).toBe(true);
        expect(denganReferences.has(key), `${key} belum punya blok rujukan resmi`).toBe(true);
      }
    }
  });

  it('jumlah sub-bab yang punya rujukan resmi tidak pernah turun', () => {
    // Naikkan angka ini setiap batch revisi selesai. Turun = rujukan hilang dari materi.
    // Batch 1 (2026-08-03): Frontend Basic Bab 1 — 16 sub-bab.
    // Batch 2 (2026-08-03): Frontend Basic Bab 2 — 12 sub-bab. Kumulatif 28.
    // Batch 3 (2026-08-03): Frontend Basic Bab 3 — 12 sub-bab. Kumulatif 40.
    // Batch 4 (2026-08-03): Frontend Basic Bab 4 — 13 sub-bab. Kumulatif 53.
    // Batch 5 (2026-08-03): Frontend Basic Bab 5 — 12 sub-bab. Kumulatif 65.
    expect(lessonsWithBlock('references').size).toBeGreaterThanOrEqual(65);
  });
});

describe('ukuran kurikulum yang dijanjikan dokumen', () => {
  it('31 bab dan 330 sub-bab', () => {
    const chapters = curriculum.reduce((total, category) => total + category.chapters.length, 0);
    expect(chapters).toBe(31);
    expect(allLessons.length).toBe(330);
  });

  /**
   * Guards the claim made in the README, the plan, and CLAUDE.md that Chapter 1 is complete.
   * Without this, converting a lesson back to an outline would quietly make those documents lie.
   */
  it('Frontend Basic tuntas — seluruh 6 bab, 76 sub-bab, semuanya tertulis', () => {
    const kategori = curriculum[0];
    expect(kategori?.slug).toBe('frontend-basic');
    expect(kategori?.chapters).toHaveLength(6);

    const semua = kategori?.chapters.flatMap((c) => c.lessons) ?? [];
    expect(semua).toHaveLength(76);
    expect(
      semua.every((l) => l.status === 'written'),
      'Frontend Basic masih punya sub-bab berstatus outline',
    ).toBe(true);
  });

  it('Frontend Intermediate Bab 1-4 bermateri penuh', () => {
    const harapan = [
      { slug: 'tailwind-css', jumlah: 12 },
      { slug: 'fundamental-reactjs', jumlah: 11 },
      { slug: 'pembuatan-komponen-react', jumlah: 11 },
      { slug: 'state-dan-event-handler', jumlah: 12 },
    ];

    for (const [i, { slug, jumlah }] of harapan.entries()) {
      const chapter = curriculum[1]?.chapters[i];
      expect(chapter?.slug).toBe(slug);
      expect(chapter?.lessons, slug).toHaveLength(jumlah);
      expect(
        chapter?.lessons.every((lesson) => lesson.status === 'written'),
        `${slug} masih punya sub-bab berstatus outline`,
      ).toBe(true);
    }
  });

  it('jumlah sub-bab yang sudah ditulis tercatat, agar progres penulisan tidak diklaim asal', () => {
    const written = allLessons.filter((location) => location.lesson.status === 'written').length;
    // Naikkan angka ini setiap satu bab selesai ditulis. Turun = regresi yang harus dijelaskan.
    // Seluruh kurikulum: 76 + 100 + 58 + 58 + 38 = 330. TUNTAS.
    // Angka ini tidak boleh turun — penurunan berarti materi hilang.
    expect(written).toBe(330);
  });
});

/**
 * Freshness metadata is shown to the reader as "ditinjau <tanggal>". A chapter whose material
 * was rewritten but whose date was not updated is telling the reader something false — the
 * exact failure found in the 2026-08-02 audit round 3.
 */
describe('metadata kesegaran', () => {
  it('tanggal tinjauan tidak berada di masa depan', () => {
    const besok = new Date();
    besok.setDate(besok.getDate() + 1);

    for (const category of curriculum) {
      for (const chapter of category.chapters) {
        const tanggal = new Date(chapter.reviewedAt);
        expect(
          tanggal.getTime(),
          `${category.slug}/${chapter.slug} ditinjau di masa depan`,
        ).toBeLessThan(besok.getTime());
      }
    }
  });

  /**
   * Catches the audit round 3 defect automatically: a chapter whose material was written but
   * whose review date was left at an older value, so the reader is told "ditinjau <tanggal lama>"
   * for text that is actually newer. Writing began on 2026-08-02, so any fully-written chapter
   * dated before that has a stale date by definition.
   */
  it('bab yang sudah tertulis penuh tidak boleh memakai tanggal tinjauan sebelum penulisan dimulai', () => {
    const MULAI_MENULIS = new Date('2026-08-02').getTime();

    for (const category of curriculum) {
      for (const chapter of category.chapters) {
        if (!chapter.lessons.every((l) => l.status === 'written')) continue;

        expect(
          new Date(chapter.reviewedAt).getTime(),
          `${category.slug}/${chapter.slug} tertulis penuh tapi reviewedAt masih ${chapter.reviewedAt}`,
        ).toBeGreaterThanOrEqual(MULAI_MENULIS);
      }
    }
  });

  it('bab yang seluruh sub-babnya sudah ditulis mencantumkan versi rujukan yang spesifik', () => {
    for (const category of curriculum) {
      for (const chapter of category.chapters) {
        const semuaDitulis = chapter.lessons.every((l) => l.status === 'written');
        if (!semuaDitulis) continue;

        expect(
          chapter.stackVersions.every((v) => v.trim().length > 0),
          `${category.slug}/${chapter.slug} punya versi rujukan kosong`,
        ).toBe(true);
      }
    }
  });
});
