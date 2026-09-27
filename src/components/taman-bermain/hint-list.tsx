'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { parseInline } from '@/lib/content/parse-inline';

/**
 * Hints, opened one at a time and vaguest first.
 *
 * Showing all three at once collapses into showing the answer, because the last hint is nearly it.
 * Opening them in order keeps the choice with the reader: take one more nudge, or stop.
 */
export function HintList({ hints }: { hints: string[] }) {
  const [terbuka, setTerbuka] = useState(0);

  return (
    <section>
      <h2 className="text-2xs text-faint mb-2 font-medium tracking-[0.08em] uppercase">Petunjuk</h2>

      {terbuka > 0 ? (
        <ol className="mb-3 space-y-2">
          {hints.slice(0, terbuka).map((hint, index) => (
            <li key={index} className="border-border bg-raised rounded-md border px-3 py-2">
              <p className="text-2xs text-faint mb-0.5">Petunjuk {index + 1}</p>
              <p className="text-muted text-sm leading-relaxed">{parseInline(hint)}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {terbuka < hints.length ? (
        <Button variant="ghost" size="sm" onClick={() => setTerbuka((n) => n + 1)}>
          Buka petunjuk {terbuka + 1} dari {hints.length}
        </Button>
      ) : (
        <p className="text-2xs text-faint">Semua petunjuk sudah terbuka.</p>
      )}
    </section>
  );
}
