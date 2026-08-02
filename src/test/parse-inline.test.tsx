import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseInline } from '@/lib/content/parse-inline';

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
