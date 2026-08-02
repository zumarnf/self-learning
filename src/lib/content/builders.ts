import type { Block, CalloutTone, CodeLang, ComparePane, QuizQuestion } from './types';

/**
 * Authoring helpers.
 *
 * Content files are TypeScript, which is the price paid for type-checked lessons (ADR-0003).
 * These builders pay part of that price back: writing `p('...')` instead of
 * `{ kind: 'paragraph', text: '...' }` keeps a 60-block lesson readable.
 *
 * They are deliberately thin — no defaulting, no cleverness. A helper that quietly rewrites
 * content would make lessons harder to reason about, not easier.
 */

export function h2(text: string, id?: string): Block {
  return id === undefined
    ? { kind: 'heading', level: 2, text }
    : { kind: 'heading', level: 2, text, id };
}

export function h3(text: string, id?: string): Block {
  return id === undefined
    ? { kind: 'heading', level: 3, text }
    : { kind: 'heading', level: 3, text, id };
}

export function p(text: string): Block {
  return { kind: 'paragraph', text };
}

export function ul(...items: string[]): Block {
  return { kind: 'list', items };
}

export function ol(...items: string[]): Block {
  return { kind: 'list', ordered: true, items };
}

export function code(
  lang: CodeLang,
  source: string,
  options: { filename?: string; caption?: string } = {},
): Block {
  return {
    kind: 'code',
    lang,
    // Content files indent code inside template literals; strip that shared indentation so the
    // rendered sample starts at column zero the way a real file does.
    code: dedent(source),
    ...(options.filename === undefined ? {} : { filename: options.filename }),
    ...(options.caption === undefined ? {} : { caption: options.caption }),
  };
}

export function callout(tone: CalloutTone, title: string, ...body: string[]): Block {
  return { kind: 'callout', tone, title, body };
}

export function table(head: string[], rows: string[][], caption?: string): Block {
  return caption === undefined
    ? { kind: 'table', head, rows }
    : { kind: 'table', head, rows, caption };
}

export function steps(...items: { title: string; body: string }[]): Block {
  return { kind: 'steps', items };
}

export function compare(left: ComparePane, right: ComparePane): Block {
  return {
    kind: 'compare',
    left: { ...left, code: dedent(left.code) },
    right: { ...right, code: dedent(right.code) },
  };
}

export function quiz(id: string, questions: QuizQuestion[]): Block {
  return { kind: 'quiz', id, questions };
}

export function checklist(id: string, title: string, ...items: string[]): Block {
  return { kind: 'checklist', id, title, items };
}

export function playground(
  template: 'vanilla' | 'react',
  files: Record<string, string>,
  title?: string,
): Block {
  const dedented: Record<string, string> = {};
  for (const [name, source] of Object.entries(files)) {
    dedented[name] = dedent(source);
  }
  return title === undefined
    ? { kind: 'playground', template, files: dedented }
    : { kind: 'playground', template, files: dedented, title };
}

export const divider: Block = { kind: 'divider' };

/**
 * Remove the indentation shared by every non-empty line, then trim surrounding blank lines.
 * Tabs count as one character on purpose: mixing tabs and spaces in a sample is a bug in the
 * sample, and normalising it here would hide that.
 */
export function dedent(source: string): string {
  const lines = source.replace(/\t/g, '  ').split('\n');

  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const indent = line.length - line.trimStart().length;
    if (indent < minIndent) minIndent = indent;
  }

  if (!Number.isFinite(minIndent)) minIndent = 0;

  return lines
    .map((line) => (line.trim().length === 0 ? '' : line.slice(minIndent)))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '');
}
