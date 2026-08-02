/**
 * Lesson content model.
 *
 * Lessons are data, not markup: an array of `Block` objects that one renderer turns into UI.
 * The union is discriminated on `kind`, and `BlockRenderer` exhausts it via `assertNever`, so
 * adding a block type here is a compile error until every renderer handles it (ADR-0003).
 *
 * Text fields support a small inline syntax handled by `parseInline`:
 *   `code`   **bold**   *italic*   [text](href)
 * That parser returns React nodes, never an HTML string — there is no `innerHTML` path for
 * lesson text (.claude/rules/security.md → XSS).
 */

/**
 * Languages the syntax highlighter is allowed to load. Keeping this closed keeps the Shiki
 * bundle bounded, and a curriculum integrity test fails if a lesson uses anything else.
 */
export const CODE_LANGUAGES = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'css',
  'json',
  'bash',
  'sql',
  'php',
  'yaml',
  'diff',
  'text',
] as const;

export type CodeLang = (typeof CODE_LANGUAGES)[number];

export type CalloutTone = 'info' | 'tip' | 'warning' | 'danger';

export type QuizQuestion = {
  /** Stable id — quiz answers are stored per question, so this must not change casually. */
  id: string;
  question: string;
  options: string[];
  /** Index into `options`. Validated against `options.length` by the integrity test. */
  answerIndex: number;
  /** Why the correct option is correct. Shown for every question after submitting. */
  explanation: string;
};

export type ComparePane = {
  title: string;
  lang: CodeLang;
  code: string;
  notes?: string[];
};

export type Block =
  | { kind: 'heading'; level: 2 | 3; text: string; id?: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | {
      kind: 'code';
      lang: CodeLang;
      code: string;
      filename?: string;
      caption?: string;
    }
  | { kind: 'callout'; tone: CalloutTone; title?: string; body: string[] }
  | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { kind: 'steps'; items: { title: string; body: string }[] }
  | { kind: 'compare'; left: ComparePane; right: ComparePane }
  | { kind: 'quiz'; id: string; questions: QuizQuestion[] }
  | { kind: 'checklist'; id: string; title: string; items: string[] }
  | {
      kind: 'playground';
      template: 'vanilla' | 'react';
      files: Record<string, string>;
      title?: string;
    }
  | { kind: 'divider' };

export type BlockKind = Block['kind'];

/**
 * Compile-time exhaustiveness guard. Reaching this at runtime means a `Block` variant was added
 * without a renderer, which the type system should already have caught.
 */
export function assertNever(value: never, context: string): never {
  throw new Error(`Unhandled ${context}: ${JSON.stringify(value)}`);
}
