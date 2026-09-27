import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SoalClient } from '@/app/taman-bermain/[slug]/soal-client';
import { getExerciseBank } from '@/content/taman-bermain';
import { __resetStoreForTests } from '@/lib/learning/store';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * The exercise page as a learner sees it.
 *
 * What these guard is the revision that made exercises readable for a beginner: prose rendered
 * through the inline parser instead of as raw backticks, the brief in fixed sections, worked
 * examples that show their input data, and an answer key that explains itself and shows the other
 * correct answers and the common mistakes.
 *
 * Highlighted HTML is stubbed with a marker string — Shiki runs on the server and is tested by
 * the lesson renderer; what matters here is that the page puts each piece where it belongs.
 */

const BANK = getExerciseBank();
const soal = (slug: string): Exercise => {
  const e = BANK.find((x) => x.slug === slug);
  if (!e) throw new Error(`soal ${slug} tidak ada`);
  return e;
};

type Tetangga = { slug: string; title: string } | null;

function tampilkan(
  exercise: Exercise,
  tetangga: { previous: Tetangga; next: Tetangga } = { previous: null, next: null },
) {
  return render(
    <SoalClient
      exercise={exercise}
      highlighted={{
        solution: '<pre data-kunci>kode kunci</pre>',
        alternatives: exercise.alternativeSolutions.map(
          (_, i) => `<pre data-alt>cara ${i + 1}</pre>`,
        ),
        mistakes: exercise.rejectedSolutions.map((r) => ({
          reason: r.reason,
          html: '<pre data-salah>x</pre>',
        })),
        given: exercise.brief.given ? '<pre data-given>kode diberikan</pre>' : null,
      }}
      chapter={null}
      previous={tetangga.previous}
      next={tetangga.next}
    />,
  );
}

beforeEach(() => {
  __resetStoreForTests();
});

describe('halaman soal — bagian soal', () => {
  it('menampilkan bagian soal dalam urutan tetap', () => {
    tampilkan(soal('saring-daftar-aktif'));
    const judul = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '');
    const urutan = [
      'Situasinya',
      'Yang harus kamu buat',
      'Contoh',
      'Aturan',
      'Yang sering terlewat',
    ];
    const posisi = urutan.map((u) => judul.findIndex((j) => j.startsWith(u)));
    expect(
      posisi.every((p) => p >= 0),
      `bagian yang hilang: ${judul.join(' | ')}`,
    ).toBe(true);
    expect([...posisi].sort((a, b) => a - b)).toEqual(posisi);
  });

  it('merender backtick sebagai kode, bukan sebagai simbol mentah', () => {
    // Masalah yang memicu revisi ini: brief dulu dirender mentah dan backtick-nya terlihat.
    const { container } = tampilkan(soal('saring-daftar-aktif'));
    const tugas = screen.getByRole('heading', { name: /Yang harus kamu buat/ })
      .parentElement as HTMLElement;
    expect(tugas.textContent).not.toContain('`');
    expect(within(tugas).getAllByText('saringAktif', { selector: 'code' }).length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll('code').length).toBeGreaterThan(5);
  });

  it('judul soal sebelum dan sesudahnya juga dirender sebagai kode, bukan backtick mentah', () => {
    // The page title went through parseInline, but the links to neighbouring exercises rendered
    // theirs raw, so 32 of 72 built pages showed literal backticks at the bottom.
    tampilkan(soal('saring-daftar-aktif'), {
      previous: soal('balik-urutan-angka'),
      next: soal('sql-select-where-order'),
    });
    const nav = screen.getByRole('navigation', { name: 'Soal lain' });
    expect(nav.textContent).not.toContain('`');
    expect(within(nav).getByText('for', { selector: 'code' })).toBeTruthy();
    expect(within(nav).getByText('SELECT', { selector: 'code' })).toBeTruthy();
  });

  it('menampilkan data masukan contoh, bukan hanya ekspresinya', () => {
    // Dulu `saringAktif(data)` menyebut `data` yang tidak pernah terlihat pembelajar.
    tampilkan(soal('saring-daftar-aktif'));
    expect(screen.getByText('Data yang tersedia')).toBeInTheDocument();
    expect(screen.getByText(/const data = \[/)).toBeInTheDocument();
    expect(screen.getByText('Kalau dipanggil')).toBeInTheDocument();
    expect(screen.getByText('Hasilnya harus')).toBeInTheDocument();
  });

  it('menampilkan istilah beserta penjelasannya', () => {
    tampilkan(soal('saring-daftar-aktif'));
    const kotak = screen.getByRole('complementary', { name: /Istilah di soal ini/ });
    // Istilahnya sendiri ada di <dt>; namanya juga boleh muncul di penjelasan istilah lain.
    expect(within(kotak).getByText('filter()', { selector: 'dt' })).toBeInTheDocument();
  });

  it('menampilkan kode yang sudah ada sebagai blok kode, bukan pagar teks di paragraf', () => {
    const { container } = tampilkan(soal('pakai-komponen-di-file-lain'));
    expect(screen.getByRole('heading', { name: /Kode yang sudah ada/ })).toBeInTheDocument();
    // Label berkas di atas blok kode. Nama yang sama juga muncul sebagai <code> di teks tugas.
    expect(screen.getByText('src/components/ui/button.tsx', { selector: 'p' })).toBeInTheDocument();
    expect(container.querySelector('[data-given]')).not.toBeNull();
    expect(container.textContent).not.toContain('```');
  });

  it('tidak menampilkan bagian Contoh untuk soal yang diperiksa strukturnya', () => {
    tampilkan(soal('migration-tabel-catatan'));
    expect(screen.queryByRole('heading', { name: /^Contoh/ })).toBeNull();
  });
});

describe('halaman soal — kunci jawaban', () => {
  async function bukaKunci(exercise: Exercise) {
    const user = userEvent.setup();
    const hasil = tampilkan(exercise);
    await user.click(screen.getByRole('button', { name: 'Lihat kunci jawaban' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tampilkan' }));
    return hasil;
  }

  it('tertutup sampai dikonfirmasi, dan menyebut apa isinya', () => {
    const { container } = tampilkan(soal('balik-urutan-angka'));
    expect(container.querySelector('[data-kunci]')).toBeNull();
    expect(screen.getByText(/langkah demi langkah, cara lain yang juga benar/)).toBeInTheDocument();
  });

  it('menampilkan kode, langkah demi langkah, dan inti yang perlu diingat', async () => {
    const e = soal('balik-urutan-angka');
    const { container } = await bukaKunci(e);
    expect(container.querySelector('[data-kunci]')).not.toBeNull();
    const langkah = screen.getByRole('heading', { name: /langkah demi langkah/i })
      .nextElementSibling as HTMLElement;
    expect(within(langkah).getAllByRole('listitem')).toHaveLength(e.solution.steps.length);
    expect(screen.getByText('Inti yang perlu diingat')).toBeInTheDocument();
  });

  it('menampilkan setiap cara lain yang juga benar', async () => {
    const e = soal('balik-urutan-angka');
    await bukaKunci(e);
    expect(screen.getByRole('heading', { name: /Cara lain yang juga benar/ })).toBeInTheDocument();
    e.alternativeSolutions.forEach((_, i) => {
      expect(screen.getByText(`Cara lain ${i + 1}`)).toBeInTheDocument();
    });
  });

  it('menampilkan setiap kesalahan yang sering terjadi beserta alasannya', async () => {
    const e = soal('balik-urutan-angka');
    await bukaKunci(e);
    const bagian = screen.getByRole('heading', { name: /Kesalahan yang sering terjadi/ })
      .parentElement as HTMLElement;
    expect(within(bagian).getAllByRole('listitem')).toHaveLength(e.rejectedSolutions.length);
    expect(within(bagian).getAllByText('Lihat kodenya')).toHaveLength(e.rejectedSolutions.length);
  });
});
