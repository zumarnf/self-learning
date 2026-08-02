import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the bundle leak found in the 2026-08-02 audit.
 *
 * `SidebarNav` and five pages were Client Components that imported the curriculum. Because a
 * bundler cannot tree-shake unused *properties* of an object it has to construct, that pulled
 * every written lesson's prose and code samples into the browser bundle — 86 KB gzip at three
 * written chapters, and growing without bound as more were written.
 *
 * The fix was to build slim projections in Server Components and pass them down as props. This
 * test enforces that boundary at the source level, because the failure is completely invisible
 * in the UI: everything works, it is just increasingly expensive for the reader.
 *
 * Type-only imports are fine — they disappear at compile time and carry no runtime cost.
 */

const SRC = join(process.cwd(), 'src');

/** Modules that reach the curriculum data at runtime and must stay server-side. */
const FORBIDDEN_IN_CLIENT = [
  "from '@/content/curriculum",
  "from '@/lib/curriculum/queries'",
  "from '@/lib/curriculum/authoring'",
];

/*
 * `@/content/glossary` and `@/content/cheatsheets` are deliberately NOT on that list. They are
 * small, and they are the actual content of the one page that imports them — landing in that
 * route's own chunk is correct, not a leak. The curriculum is different: it is enormous, it grows
 * with every chapter written, and the pages that imported it only ever needed slugs and titles.
 */

function collectTsxFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...collectTsxFiles(full));
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      found.push(full);
    }
  }
  return found;
}

/** A `'use client'` directive must be the first statement to count. */
function isClientModule(source: string): boolean {
  const firstLine = source
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith('//') && !line.startsWith('/*'));

  return firstLine === "'use client';" || firstLine === '"use client";';
}

describe('batas bundle klien', () => {
  const files = collectTsxFiles(SRC).filter((file) => !file.includes(`${'/'}test${'/'}`));

  it('ada Client Component untuk diperiksa (memastikan tes ini benar-benar berjalan)', () => {
    const clientFiles = files.filter((file) => isClientModule(readFileSync(file, 'utf8')));
    expect(clientFiles.length).toBeGreaterThan(5);
  });

  it('tidak ada Client Component yang mengimpor kurikulum saat runtime', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      if (!isClientModule(source)) continue;

      for (const line of source.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('import')) continue;
        // `import type { ... }` is erased at compile time and costs nothing at runtime.
        if (trimmed.startsWith('import type')) continue;

        for (const forbidden of FORBIDDEN_IN_CLIENT) {
          if (trimmed.includes(forbidden)) {
            offenders.push(`${file.replace(SRC, 'src')} → ${trimmed}`);
          }
        }
      }
    }

    expect(
      offenders,
      `Client Component tidak boleh mengimpor data kurikulum — bangun proyeksi ramping di Server Component lalu oper sebagai prop.\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});

/**
 * Regression guard for the build-time network dependency found in the 2026-08-02 audit.
 *
 * `next/font/google` downloads font files while building. That is invisible until the day
 * Google's servers are unreachable — and then the production build fails on code that has not
 * changed, with no local cache to fall back on. It happened here.
 *
 * The fonts now live in `src/app/fonts/` and load through `next/font/local`, so the build reads
 * them from disk. This test keeps it that way: the alternative is a build whose success depends
 * on someone else's uptime.
 */
describe('kemandirian build', () => {
  const files = collectTsxFiles(SRC).filter((file) => !file.includes(`${'/'}test${'/'}`));

  it('tidak ada modul yang mengunduh font dari Google saat build', () => {
    const offenders = files.filter((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .some((line) => line.trim().startsWith('import') && line.includes('next/font/google')),
    );

    expect(
      offenders.map((file) => file.replace(SRC, 'src')),
      'Pakai next/font/local dengan berkas di src/app/fonts/ — build tidak boleh bergantung pada jaringan.',
    ).toEqual([]);
  });

  it('berkas font yang dirujuk benar-benar ada di repo', () => {
    const layout = readFileSync(join(SRC, 'app', 'layout.tsx'), 'utf8');
    const referenced = [...layout.matchAll(/src:\s*'\.\/(fonts\/[^']+)'/g)].map(
      (match) => match[1],
    );

    expect(referenced.length, 'layout.tsx harus memuat font lokal').toBeGreaterThanOrEqual(3);

    for (const relative of referenced) {
      const full = join(SRC, 'app', relative as string);
      expect(statSync(full).size, `${relative} kosong atau terlalu kecil`).toBeGreaterThan(10_000);
    }
  });
});
