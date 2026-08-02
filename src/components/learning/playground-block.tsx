'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/primitives';

/**
 * Live code playground.
 *
 * Sandpack is by far the heaviest dependency in this project, so it is loaded lazily and only
 * when a reader actually asks for it: a lesson page that contains a playground still ships none
 * of it until the button is pressed (NFR-P6, FR-7.2).
 *
 * Execution happens inside Sandpack's sandboxed iframe (FR-7.3). The code comes from the reader
 * and runs on the reader's own machine with no server and no other user's data in reach.
 */

const Sandpack = dynamic(
  () => import('@codesandbox/sandpack-react').then((mod) => ({ default: mod.Sandpack })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2" role="status" aria-label="Menyiapkan playground">
        <Skeleton className="h-64 w-full" />
        <p className="text-2xs text-faint">Menyiapkan playground…</p>
      </div>
    ),
  },
);

export function PlaygroundBlock({
  template,
  files,
  title = 'Coba sendiri',
}: {
  template: 'vanilla' | 'react';
  files: Record<string, string>;
  title?: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <section className="not-prose border-border bg-surface my-10 overflow-hidden rounded-lg border">
      <header className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
        <div>
          <h3 className="text-text font-sans text-sm font-semibold">{title}</h3>
          <p className="text-2xs text-faint mt-0.5">
            Berjalan di dalam iframe tersandbox di browser kamu. Tidak ada yang dikirim ke mana pun.
          </p>
        </div>
        {!active ? (
          <Button variant="secondary" size="sm" onClick={() => setActive(true)}>
            Jalankan
          </Button>
        ) : null}
      </header>

      <div className="p-3">
        {active ? (
          <Sandpack
            template={template}
            files={files}
            options={{ editorHeight: 360, showLineNumbers: true, showTabs: true }}
          />
        ) : (
          <div className="border-border rounded-md border border-dashed px-4 py-8 text-center">
            <p className="text-muted text-sm">
              Playground belum dimuat supaya halaman ini tetap ringan.
            </p>
            <p className="text-2xs text-faint mt-1">
              Tekan <span className="text-muted font-medium">Jalankan</span> untuk memuat editor.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
