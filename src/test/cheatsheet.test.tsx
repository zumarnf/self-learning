import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CheatsheetPage from '@/app/cheatsheet/page';
import { CHEATSHEET_GROUPS, cheatsheets } from '@/content/cheatsheets';

/**
 * The cheatsheet data and the page that renders it.
 *
 * Every string here is content, so none of it is checked by the type system: a duplicate row
 * becomes a React key warning nobody sees, an odd backtick leaks onto the page, and a note that
 * drifts into a paragraph turns a quick reference into a second copy of the lessons. These tests
 * are what catches that — the same role `curriculum-integrity.test.ts` plays for the lessons.
 */

/** Prose with inline code removed; the punctuation rules apply to prose only. */
function prosa(teks: string): string {
  return teks.replace(/`[^`]*`/g, ' ');
}

const semuaProsa = cheatsheets.flatMap((sheet) => [
  { lokasi: `${sheet.slug} · summary`, teks: sheet.summary },
  ...sheet.sections.flatMap((section) => [
    { lokasi: `${sheet.slug} · ${section.title}`, teks: section.title },
    ...section.rows.map((row) => ({
      lokasi: `${sheet.slug} · ${section.title} · ${row.code}`,
      teks: row.note,
    })),
  ]),
]);

describe('cheatsheet — bentuk data', () => {
  it('setiap lembar punya slug unik dan kelompok yang dikenal', () => {
    const slug = cheatsheets.map((s) => s.slug);
    expect(new Set(slug).size).toBe(slug.length);
    for (const sheet of cheatsheets) {
      expect(CHEATSHEET_GROUPS, sheet.slug).toContain(sheet.group);
    }
  });

  it('judul bagian unik per lembar, dan kode baris unik per bagian', () => {
    // Both are React keys on the page. A duplicate renders fine and warns only in the console.
    for (const sheet of cheatsheets) {
      const judul = sheet.sections.map((s) => s.title);
      expect(new Set(judul).size, sheet.slug).toBe(judul.length);
      for (const section of sheet.sections) {
        const kode = section.rows.map((r) => r.code);
        const kembar = kode.filter((k, i) => kode.indexOf(k) !== i);
        expect(kembar, `${sheet.slug} · ${section.title}`).toEqual([]);
      }
    }
  });

  it('setiap lembar punya minimal 2 bagian, dan setiap bagian minimal 3 baris', () => {
    for (const sheet of cheatsheets) {
      expect(sheet.sections.length, sheet.slug).toBeGreaterThanOrEqual(2);
      for (const section of sheet.sections) {
        expect(section.rows.length, `${sheet.slug} · ${section.title}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('kode dan catatan tidak kosong, dan catatan tetap pendek', () => {
    // A quick reference, not a lesson. A note that needs more than this belongs in the curriculum.
    for (const sheet of cheatsheets) {
      for (const section of sheet.sections) {
        for (const row of section.rows) {
          const lokasi = `${sheet.slug} · ${section.title} · ${row.code}`;
          expect(row.code.trim().length, lokasi).toBeGreaterThan(0);
          expect(row.note.trim().length, lokasi).toBeGreaterThan(0);
          expect(row.note.length, lokasi).toBeLessThanOrEqual(110);
        }
      }
    }
  });
});

describe('cheatsheet — gaya bahasa (memori prosa-tanda-baca-minim)', () => {
  it('nol tanda pisah, titik koma, dan titik dua di prosa', () => {
    const langgar = semuaProsa
      .filter(({ teks }) => /[—–]|;|:(?!\d)/.test(prosa(teks)))
      .map(({ lokasi, teks }) => `${lokasi} → ${teks}`);
    expect(langgar, langgar.join('\n')).toEqual([]);
  });

  it('backtick selalu berpasangan, dan tidak ada tanda yang dibaca sebagai format', () => {
    // An odd backtick renders literally. A bare `*` outside code turns the rest of the note italic.
    const langgar = semuaProsa
      .filter(({ teks }) => (teks.match(/`/g) ?? []).length % 2 !== 0 || /[*[\]]/.test(prosa(teks)))
      .map(({ lokasi, teks }) => `${lokasi} → ${teks}`);
    expect(langgar, langgar.join('\n')).toEqual([]);
  });
});

describe('cheatsheet — cakupan (ratchet)', () => {
  // Numbers may go up, never down. The count that lives only in a plan drifts within weeks.
  it('memuat minimal 20 lembar dan 562 baris', () => {
    const baris = cheatsheets.flatMap((s) => s.sections.flatMap((x) => x.rows));
    expect(cheatsheets.length).toBeGreaterThanOrEqual(20);
    expect(baris.length).toBeGreaterThanOrEqual(562);
  });

  it('setiap kelompok punya minimal satu lembar', () => {
    for (const group of CHEATSHEET_GROUPS) {
      expect(
        cheatsheets.some((s) => s.group === group),
        group,
      ).toBe(true);
    }
  });
});

describe('halaman cheatsheet', () => {
  it('merender backtick di catatan sebagai kode, bukan simbol mentah', () => {
    const { container } = render(<CheatsheetPage />);
    const salinan = container.cloneNode(true) as HTMLElement;
    for (const el of salinan.querySelectorAll('code')) el.remove();
    expect(salinan.textContent).not.toContain('`');
  });

  it('navigasi dikelompokkan, dan setiap lembar punya tepat satu tautan', () => {
    render(<CheatsheetPage />);
    const nav = screen.getByRole('navigation', { name: 'Daftar cheatsheet' });
    for (const group of CHEATSHEET_GROUPS) {
      expect(within(nav).getByText(group)).toBeTruthy();
    }
    const tautan = within(nav).getAllByRole('link');
    expect(tautan.map((a) => a.getAttribute('href')).sort()).toEqual(
      cheatsheets.map((s) => `#${s.slug}`).sort(),
    );
  });
});
