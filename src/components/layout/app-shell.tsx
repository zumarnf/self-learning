'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';
import type { NavCategory } from '@/lib/curriculum/queries';
import { useLearningStore } from '@/lib/learning/store';
import { cn } from '@/lib/utils/cn';

/**
 * Application frame: skip link, header, sidebar (drawer below 1024px), and main region.
 *
 * The whole shell is a Client Component because navigation state, the theme control, and the
 * progress markers in the sidebar all need the browser. Lesson content is passed in as
 * `children` from Server Components, so it never crosses into the client bundle
 * (SDD §2.3 — the client boundary wraps the chrome, not the content).
 */

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/kelas', label: 'Kelas' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/latihan', label: 'Latihan' },
  { href: '/catatan', label: 'Catatan' },
  { href: '/glosarium', label: 'Glosarium' },
  { href: '/cheatsheet', label: 'Cheatsheet' },
  { href: '/playground', label: 'Playground' },
];

export function AppShell({
  navigation,
  children,
}: {
  navigation: NavCategory[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const { status } = useLearningStore();

  // The drawer is closed by the links inside it (`onNavigate` below), not by an effect watching
  // the pathname. Calling setState from an effect on every navigation causes a cascading render
  // and is the pattern React Compiler flags — closing at the source of the action is both
  // simpler and correct.

  // Escape closes the drawer and returns focus to the control that opened it — without this,
  // keyboard users are stranded at the top of the document (NFR-A2).
  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        openerRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const isLessonArea = pathname.startsWith('/kelas');

  return (
    <div className="min-h-dvh">
      <a
        href="#konten"
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:shadow-sm"
      >
        Lompat ke konten
      </a>

      <header className="border-border bg-bg/85 sticky top-0 z-30 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4">
          {isLessonArea ? (
            <button
              ref={openerRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-controls="sidebar-drawer"
              className="text-muted hover:bg-raised hover:text-text inline-flex h-9 w-9 items-center justify-center rounded-md lg:hidden"
            >
              <MenuIcon size={17} />
              <span className="sr-only">Buka daftar kurikulum</span>
            </button>
          ) : null}

          <Link href="/" className="text-text flex items-center gap-2 font-medium">
            <span
              aria-hidden="true"
              className="bg-primary-fill inline-block h-3.5 w-3.5 rotate-45 rounded-[3px]"
            />
            <span className="text-sm">Ruang Belajar Fullstack</span>
          </Link>

          <nav aria-label="Menu utama" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'duration-fast rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    active ? 'bg-raised text-text font-medium' : 'text-muted hover:text-text',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/pengaturan"
              className="text-muted hover:text-text duration-fast rounded-md px-2.5 py-1.5 text-sm transition-colors"
            >
              Pengaturan
            </Link>
          </div>
        </div>

        {/* Mobile menu: the primary nav does not fit at small widths, so it wraps below. */}
        <nav
          aria-label="Menu utama (layar kecil)"
          className="scroll-x border-border flex gap-1 border-t px-4 py-1.5 md:hidden"
        >
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'duration-fast shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  active ? 'bg-raised text-text font-medium' : 'text-muted',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {status !== 'ok' ? <StorageBanner status={status} /> : null}

      <div className="mx-auto flex max-w-[1600px]">
        {isLessonArea ? (
          <aside className="border-border sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[280px] shrink-0 overflow-y-auto border-r px-2 py-4 lg:block">
            <SidebarNav navigation={navigation} />
          </aside>
        ) : null}

        <main id="konten" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup daftar kurikulum"
            onClick={() => setDrawerOpen(false)}
            className="drawer-scrim absolute inset-0 bg-black/40"
          />
          <div
            id="sidebar-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Daftar kurikulum"
            className="drawer-panel border-border bg-bg absolute inset-y-0 left-0 w-[85%] max-w-[320px] overflow-y-auto border-r px-2 py-4"
          >
            <div className="mb-2 flex justify-end px-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  openerRef.current?.focus();
                }}
                className="text-muted hover:bg-raised hover:text-text inline-flex h-9 w-9 items-center justify-center rounded-md"
              >
                <CloseIcon size={17} />
                <span className="sr-only">Tutup</span>
              </button>
            </div>
            <SidebarNav navigation={navigation} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Storage failures are announced once, at the top of the app. Silently not saving a learner's
 * progress is the worst possible failure mode here (NFR-R2).
 */
function StorageBanner({ status }: { status: string }) {
  const message =
    status === 'full'
      ? 'Penyimpanan browser penuh — progres terbaru tidak tersimpan. Ekspor datamu di Pengaturan.'
      : status === 'unavailable'
        ? 'Penyimpanan lokal diblokir browser ini. Materi tetap bisa dibaca, tapi progres tidak akan tersimpan.'
        : 'Data belajar yang tersimpan tidak bisa dibaca. Salinannya diamankan — periksa di Pengaturan.';

  return (
    <div
      role="alert"
      className="border-border bg-warning-fill text-text border-b px-4 py-2 text-center text-xs"
    >
      {message}
    </div>
  );
}
