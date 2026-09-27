'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The editor: a real `<textarea>`, not an editor widget.
 *
 * Exercises here are five to twenty-five lines. At that size a native control wins on everything
 * that matters — it works with screen readers, autofill, and browser undo without any of it being
 * rebuilt, and it costs nothing in the bundle. Syntax highlighting is a comfort worth roughly
 * 200 KB, and the answer key IS highlighted, where reading matters most.
 *
 * KEYBOARD TRAP, and how it is escaped. Tab inserts indentation, which by itself would trap a
 * keyboard user inside the editor — a WCAG 2.1.2 failure. Escape releases it: after Escape, Tab
 * moves focus normally. That escape route is printed under the editor as visible text, not hidden
 * in `aria-describedby`, because the success criterion requires the user to KNOW the way out.
 */

const INDENT = '  ';

export function CodeEditor({
  value,
  onChange,
  label,
  rows = 14,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  rows?: number;
}) {
  const id = useId();
  const helpId = `${id}-bantuan`;
  const areaRef = useRef<HTMLTextAreaElement>(null);
  /** Set by Escape, cleared by any other key: the one-shot release for the Tab trap. */
  const escaping = useRef(false);

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Escape') {
      escaping.current = true;
      return;
    }

    if (event.key !== 'Tab') {
      escaping.current = false;
      return;
    }

    // Escape was pressed just before: let Tab do its normal job and leave.
    if (escaping.current) {
      escaping.current = false;
      return;
    }

    event.preventDefault();
    const area = event.currentTarget;
    const { selectionStart, selectionEnd } = area;
    const next = `${value.slice(0, selectionStart)}${INDENT}${value.slice(selectionEnd)}`;
    onChange(next);

    // Restore the caret after React re-renders with the new value.
    requestAnimationFrame(() => {
      const el = areaRef.current;
      if (!el) return;
      el.selectionStart = selectionStart + INDENT.length;
      el.selectionEnd = selectionStart + INDENT.length;
    });
  }

  const lineCount = Math.max(value.split('\n').length, rows);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      {/*
        The container reacts to focus as a grouping cue, but it is NOT the focus indicator. The
        indicator is the app's single `:focus-visible` outline in `globals.css`, which the
        textarea below must never remove — the rule there says so in as many words.
      */}
      <div className="border-code-border focus-within:border-border-strong bg-code-bg duration-fast flex overflow-hidden rounded-md border transition-colors">
        {/* Decorative: the numbers are a reading aid, and announcing them would read as noise. */}
        <div
          aria-hidden="true"
          className="text-faint border-code-border shrink-0 border-r px-2 py-3 text-right font-mono text-xs leading-[1.6] select-none"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={areaRef}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          aria-describedby={helpId}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          rows={rows}
          // No `outline-none` here. The one global focus style in `globals.css` carries an
          // explicit instruction never to remove it without a replacement, and a code editor is
          // the last place to make focus invisible.
          className={cn(
            'text-text flex-1 resize-y bg-transparent px-3 py-3 font-mono text-xs leading-[1.6]',
            '-outline-offset-2',
          )}
        />
      </div>

      <p id={helpId} className="text-2xs text-faint mt-1.5">
        Tab menyisipkan indentasi. Tekan <span className="text-muted font-medium">Esc</span> lalu{' '}
        <span className="text-muted font-medium">Tab</span> untuk memindahkan fokus keluar dari
        editor.
      </p>
    </div>
  );
}
