import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import type { NavCategory } from '@/lib/curriculum/queries';

vi.mock('next/navigation', () => ({
  usePathname: () => '/kelas/frontend-basic/js-dasar/apa-itu-javascript',
}));

const navigation: NavCategory[] = [
  {
    slug: 'frontend-basic',
    order: 1,
    title: 'Frontend Basic',
    chapters: [
      {
        slug: 'js-dasar',
        number: 1,
        title: 'Belajar JavaScript dari Nol untuk Pemula',
        lessons: [
          {
            slug: 'apa-itu-javascript',
            index: 1,
            title: 'Apa itu JavaScript & Cara Menjalankannya',
          },
          { slug: 'variabel', index: 2, title: 'Variabel: let, const, dan kenapa' },
        ],
      },
    ],
  },
];

describe('SidebarNav', () => {
  it('lets the user collapse the chapter that is currently active', async () => {
    const user = userEvent.setup();
    render(<SidebarNav navigation={navigation} />);

    // The active chapter starts expanded — its lessons are visible.
    expect(screen.getByText('Variabel: let, const, dan kenapa')).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', {
      name: /Tutup daftar sub-bab Belajar JavaScript dari Nol untuk Pemula/,
    });
    await user.click(collapseButton);

    // Clicking the chevron on the active chapter must be able to collapse it.
    expect(screen.queryByText('Variabel: let, const, dan kenapa')).not.toBeInTheDocument();
  });

  it('lets the user collapse the category that is currently active', async () => {
    const user = userEvent.setup();
    render(<SidebarNav navigation={navigation} />);

    // The active category starts expanded — its chapters are visible.
    expect(screen.getByText('Belajar JavaScript dari Nol untuk Pemula')).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', { name: /Frontend Basic/ });
    await user.click(collapseButton);

    // Clicking the chevron on the active category must be able to collapse it.
    expect(screen.queryByText('Belajar JavaScript dari Nol untuk Pemula')).not.toBeInTheDocument();
  });
});
