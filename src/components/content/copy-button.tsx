'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

/**
 * Copy-to-clipboard control for a code block.
 *
 * This is the only interactive part of a code block, so it is the only part that becomes a
 * Client Component — the highlighted code itself stays server-rendered (ADR-0004).
 *
 * The result is announced through a live region, because a colour and icon change alone is not
 * feedback for someone using a screen reader
 * (.claude/rules/frontend.md → accessibility baseline).
 */
export function CopyButton({ value, label = 'kode' }: { value: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Clearing on unmount prevents a state update on a component that is already gone.
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      // Absent in insecure contexts and in some embedded browsers — treated as a real failure
      // the reader is told about, not swallowed.
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 1800);
  }

  const message =
    state === 'copied' ? 'Tersalin' : state === 'failed' ? 'Gagal menyalin' : `Salin ${label}`;

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={cn(
          'text-2xs inline-flex h-8 items-center gap-1.5 rounded-sm px-2 font-medium',
          'text-muted hover:bg-raised hover:text-text duration-fast transition-colors',
        )}
      >
        {state === 'copied' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
        <span>{state === 'copied' ? 'Tersalin' : state === 'failed' ? 'Gagal' : 'Salin'}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
    </>
  );
}
