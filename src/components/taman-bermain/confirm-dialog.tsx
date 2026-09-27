'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { CloseIcon } from '@/components/ui/icons';

/**
 * A confirmation dialog for the two actions here that cannot be undone: revealing the answer key,
 * and resetting the editor.
 *
 * Not `window.confirm`. That cannot be styled, reads inconsistently across assistive tech, and
 * blocks the whole tab. Focus is trapped while open and Escape closes it, matching the drawer in
 * `AppShell` so this app has one dialog behaviour rather than two.
 *
 * Focus lands on the panel's first control, which is the close button. That is deliberate: the
 * least destructive action should be the one already under the reader's hands.
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // useId, not a random string: it is stable across render and across hydration, which is
  // exactly what an `aria-labelledby` target has to be.
  const titleId = useId();

  useEffect(() => {
    panelRef.current?.querySelector('button')?.focus();

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }
      if (event.key !== 'Tab') return;

      const fokusable = panelRef.current?.querySelectorAll<HTMLElement>('button');
      if (!fokusable || fokusable.length === 0) return;

      const pertama = fokusable[0] as HTMLElement;
      const terakhir = fokusable[fokusable.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === pertama) {
        event.preventDefault();
        terakhir.focus();
      } else if (!event.shiftKey && document.activeElement === terakhir) {
        event.preventDefault();
        pertama.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup konfirmasi"
        onClick={onCancel}
        className="drawer-scrim absolute inset-0 bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="border-border bg-surface relative w-full max-w-md rounded-lg border p-5 shadow-md"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-text font-sans text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            className="text-muted hover:bg-raised hover:text-text -mt-1 -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="text-muted text-sm">{body}</div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
