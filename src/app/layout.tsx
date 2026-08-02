import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { AppShell } from '@/components/layout/app-shell';
import { buildNavigationTree } from '@/lib/curriculum/queries';
import './globals.css';

/**
 * Fonts are self-hosted from files committed to this repository (`src/app/fonts/`), loaded via
 * `next/font/local`. They are served from this origin, so no request ever reaches a third party
 * at runtime — a privacy property and a performance one (no extra DNS lookup, no render-blocking
 * stylesheet).
 *
 * They are checked in rather than fetched with `next/font/google` on purpose. Downloading at
 * build time makes the production build depend on Google's servers being reachable, which turns
 * an outage on someone else's infrastructure into a build failure here. That happened during
 * development and is why these three `.woff2` files now live in the repo. See ADR-0005.
 *
 * All three are variable fonts covering the latin subset, so one file per family spans the whole
 * 400–700 weight range this design uses.
 *
 * Three families for three roles (Editorial Docs direction, ADR-0005): sans carries the
 * interface, serif carries what you read for a long time, mono carries code.
 */
const sans = localFont({
  src: './fonts/instrument-sans.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-instrument-sans',
});

const serif = localFont({
  src: './fonts/source-serif-4.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-source-serif',
});

const mono = localFont({
  src: './fonts/jetbrains-mono.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Ruang Belajar Fullstack',
    template: '%s · Ruang Belajar Fullstack',
  },
  description:
    'Kurikulum Fullstack Developer yang terurut dari JavaScript nol sampai deploy ke produksi, dengan progres belajar yang tersimpan di perangkatmu sendiri.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F1' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0D0B' },
  ],
};

/**
 * Applies the stored theme before the first paint.
 *
 * This has to be an inline, render-blocking script: any React-based approach runs after the
 * first paint, which means a flash of the wrong theme on every load (FR-9.2). It reads only its
 * own key and writes only a class name.
 */
const themeScript = `
(function () {
  try {
    var raw = localStorage.getItem('rbf.learning-data');
    var pref = 'system';
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.preferences && parsed.preferences.theme) {
        pref = parsed.preferences.theme;
      }
    }
    var dark = pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    // Storage blocked or data unreadable: fall back to the OS preference rather than failing.
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    } catch (e2) {}
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {/* The navigation tree is built here, in a Server Component, and handed down as a
            prop. If the sidebar imported the curriculum itself, the whole of it — every lesson's
            prose and code — would be shipped to the browser. See queries.ts for the full note. */}
        <AppShell navigation={buildNavigationTree()}>{children}</AppShell>
      </body>
    </html>
  );
}
