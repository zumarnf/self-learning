import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseInline, stripInline } from '@/lib/content/parse-inline';
import { flattenLessons } from '@/lib/curriculum/queries';

/**
 * The inline parser is the only thing standing between lesson text and the DOM, so its unhappy
 * paths matter more than its happy one: malformed input must degrade to literal text, never
 * swallow the rest of a paragraph, and never produce a live link to a dangerous scheme.
 */

function renderInline(text: string) {
  return render(<p data-testid="out">{parseInline(text)}</p>);
}

describe('parseInline — jalur normal', () => {
  it('mengembalikan teks polos apa adanya', () => {
    renderInline('Halo dunia');
    expect(screen.getByTestId('out')).toHaveTextContent('Halo dunia');
  });

  it('mengubah backtick menjadi elemen code', () => {
    const { container } = renderInline('Pakai `const` saja');
    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe('const');
  });

  it('mengubah ** menjadi strong dan * menjadi em', () => {
    const { container } = renderInline('ini **tebal** dan *miring*');
    expect(container.querySelector('strong')?.textContent).toBe('tebal');
    expect(container.querySelector('em')?.textContent).toBe('miring');
  });

  it('membuat tautan internal tanpa target blank', () => {
    const { container } = renderInline('lihat [bab satu](/kelas/frontend-basic)');
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/kelas/frontend-basic');
    expect(link?.getAttribute('target')).toBeNull();
  });

  it('memberi rel="noopener noreferrer" pada tautan eksternal', () => {
    const { container } = renderInline('baca [MDN](https://developer.mozilla.org)');
    const link = container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('mendukung format bersarang di dalam tebal', () => {
    const { container } = renderInline('**pakai `let` di sini**');
    expect(container.querySelector('strong code')?.textContent).toBe('let');
  });
});

describe('parseInline — jalur tidak bahagia', () => {
  it('string kosong menghasilkan nol node', () => {
    expect(parseInline('')).toEqual([]);
  });

  it('backtick tunggal tanpa penutup tetap jadi teks biasa', () => {
    const { container } = renderInline('harga naik 50` per unit');
    expect(container.querySelector('code')).toBeNull();
    expect(screen.getByTestId('out')).toHaveTextContent('harga naik 50` per unit');
  });

  it('kurung siku tanpa kurung bulat tetap jadi teks biasa', () => {
    const { container } = renderInline('array [0] adalah elemen pertama');
    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByTestId('out')).toHaveTextContent('array [0] adalah elemen pertama');
  });

  it('menolak skema javascript: dan menampilkannya sebagai teks', () => {
    const { container } = renderInline('[klik](javascript:alert(1))');
    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByTestId('out')).toHaveTextContent('[klik](javascript:alert(1))');
  });

  it('menolak data: URI', () => {
    const { container } = renderInline('[gambar](data:text/html;base64,PHNjcmlwdD4=)');
    expect(container.querySelector('a')).toBeNull();
  });

  it('tidak menginterpretasikan isi backtick sebagai format lain', () => {
    const { container } = renderInline('`**bukan tebal**`');
    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe('**bukan tebal**');
  });

  it('teks dengan asterisk aritmetika tidak berubah jadi miring', () => {
    const { container } = renderInline('luas = panjang * lebar');
    expect(container.querySelector('em')).toBeNull();
  });

  it('menangani beberapa format dalam satu kalimat dengan urutan benar', () => {
    const { container } = renderInline('`a`, **b**, *c*, [d](/kelas)');
    expect(container.querySelector('code')?.textContent).toBe('a');
    expect(container.querySelector('strong')?.textContent).toBe('b');
    expect(container.querySelector('em')?.textContent).toBe('c');
    expect(container.querySelector('a')?.textContent).toBe('d');
  });
});

/**
 * `stripInline` is the plain-text counterpart used for `<title>`, truncated list items, and any
 * place a React node cannot go. It must recognise exactly the same patterns as `parseInline` —
 * a title that renders as code in the heading but shows a raw backtick in the browser tab is the
 * defect this pair exists to prevent.
 */
describe('stripInline', () => {
  it('membuang backtick tapi mempertahankan isinya', () => {
    expect(stripInline('`useRef`: nilai mutable')).toBe('useRef: nilai mutable');
  });

  it('membuang penanda tebal dan miring', () => {
    expect(stripInline('Pesan Commit yang Menjelaskan *Kenapa*')).toBe(
      'Pesan Commit yang Menjelaskan Kenapa',
    );
    expect(stripInline('ini **tebal** dan *miring*')).toBe('ini tebal dan miring');
  });

  it('menyisakan teks tautan, membuang alamatnya', () => {
    expect(stripInline('lihat [panduan](/kelas/deployment)')).toBe('lihat panduan');
  });

  it('mempertahankan tautan berskema terlarang apa adanya, sama seperti parseInline', () => {
    const jahat = '[klik](javascript:alert(1))';
    expect(stripInline(jahat)).toBe(jahat);
  });

  it('membiarkan sintaks yang tidak lengkap sebagai teks biasa', () => {
    expect(stripInline('backtick `sendirian')).toBe('backtick `sendirian');
    expect(stripInline('kurung [tanpa tutup')).toBe('kurung [tanpa tutup');
  });

  it('menghasilkan teks yang sama dengan textContent parseInline', () => {
    // Inilah jaminan bahwa keduanya tidak akan menyimpang.
    const contoh = [
      '`useState`: dasar dan aturannya',
      'Optimasi: `next/image`, `next/font`, dynamic import',
      'Pesan Commit yang Menjelaskan *Kenapa*',
      'ini **tebal** dengan `kode` di dalamnya',
      'teks polos tanpa apa pun',
    ];

    for (const teks of contoh) {
      const { container, unmount } = render(<p>{parseInline(teks)}</p>);
      expect(container.textContent, teks).toBe(stripInline(teks));
      unmount();
    }
  });
});

describe('judul kurikulum', () => {
  it('setiap judul sub-bab bebas sintaks yang tidak lengkap', () => {
    // Sintaks tidak lengkap akan tampil apa adanya ke pembaca — backtick ganjil,
    // atau kurung siku yang tidak pernah ditutup.
    for (const { lesson, key } of flattenLessons()) {
      const jumlahBacktick = (lesson.title.match(/`/g) ?? []).length;
      expect(jumlahBacktick % 2, `${key}: backtick ganjil di "${lesson.title}"`).toBe(0);

      const buka = (lesson.title.match(/\[/g) ?? []).length;
      const tutup = (lesson.title.match(/\]/g) ?? []).length;
      expect(buka, `${key}: kurung siku tidak seimbang di "${lesson.title}"`).toBe(tutup);
    }
  });
});
