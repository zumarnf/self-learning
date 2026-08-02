import { createHighlighter, type Highlighter } from 'shiki';
import { CODE_LANGUAGES, type CodeLang } from './types';

/**
 * Server-side syntax highlighting (ADR-0004).
 *
 * Runs during prerendering, never in the browser: code blocks are the most frequent content in
 * this site, and shipping a highlighter to the reader for them would break the "no client JS for
 * static blocks" budget.
 *
 * Output carries both themes as CSS variables (`--shiki-light` / `--shiki-dark`), so switching
 * theme is a pure CSS swap with no re-highlight and no flash. The matching CSS lives in
 * `globals.css`.
 */

const LIGHT_THEME = 'vitesse-light';
const DARK_THEME = 'vitesse-dark';

/**
 * One highlighter per process. Creating it loads every grammar and both themes, which is far
 * too expensive to repeat for each of the several hundred code blocks in a full build.
 */
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [LIGHT_THEME, DARK_THEME],
    // `text` is Shiki's plain-text grammar and needs no loading; everything else is explicit so
    // the bundle stays bounded to what the curriculum actually uses.
    langs: CODE_LANGUAGES.filter((lang) => lang !== 'text'),
  });
  return highlighterPromise;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Highlight a code sample and return HTML.
 *
 * The caller injects this with `dangerouslySetInnerHTML`. That is safe here and only here,
 * because the input is a code string that lives in this repository — never user input. If a
 * future feature ever needs to highlight something a user typed, it must not reuse this path
 * without revisiting `.claude/rules/security.md` first.
 */
export async function highlightCode(code: string, lang: CodeLang): Promise<string> {
  if (lang === 'text') {
    return `<pre class="shiki shiki-plain"><code>${escapeHtml(code)}</code></pre>`;
  }

  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      lang,
      themes: { light: LIGHT_THEME, dark: DARK_THEME },
      defaultColor: false,
    });
  } catch (error) {
    // A grammar failure must not take down a whole lesson page. Fall back to escaped plain text
    // and make the failure visible in the server log rather than swallowing it
    // (.claude/rules/backend.md → never swallow an error silently).
    console.error(`[highlight] failed for lang "${lang}"`, error);
    return `<pre class="shiki shiki-plain"><code>${escapeHtml(code)}</code></pre>`;
  }
}
