import type { SourceLanguage } from './types';

/**
 * Blank out everything in `source` that is not executable code, so that a pattern match means
 * what it claims to mean.
 *
 * WHY THIS EXISTS. The constraint layer answers questions like "does this answer use a for loop?"
 * and "does it declare a function?" by matching patterns. Run against raw text, both questions
 * get wrong answers for code the learner wrote correctly:
 *
 *   // pakai for                 -> counted as using `for`
 *   const s = "function";        -> counted as declaring a function
 *   const s = "a//b"; for (…)    -> the real `for` swallowed by a fake comment
 *
 * Every one of those would be blamed on the learner, not on the grader (SDD §4.3).
 *
 * Removed characters are replaced with spaces rather than deleted, and newlines are kept. Two
 * things depend on that: `a/*x*\/b` must not collapse into the single token `ab`, and line
 * numbers must still line up with what the learner sees in the editor.
 *
 * KNOWN LIMITATION, stated rather than discovered later: JavaScript regex literals are not
 * tracked, because telling `/a/` from division needs real parsing. A regex containing a quote or
 * a comment marker — `/["']/`, `/\/\//` — can therefore confuse the scanner. No exercise in the
 * bank needs one; if one ever does, it gets a `rejectedSolutions` entry proving the behaviour
 * before the scanner is changed.
 */

type State =
  | { kind: 'code' }
  | { kind: 'line-comment' }
  | { kind: 'block-comment' }
  | { kind: 'quote'; quote: '"' | "'" }
  | { kind: 'template' }
  | { kind: 'heredoc'; id: string; interpolating: boolean };

/** `${` inside a template literal returns to real code until its matching brace. */
type Frame = { state: State; braceDepth: number };

export type NormalizeOptions = {
  /**
   * Keep the contents of string literals.
   *
   * Off by default, and on for the `struktur` engine only. The two engines ask different
   * questions of the source, so they need different answers here:
   *
   *   - `js` asks "does this use a for loop?". A `for` inside a string is not a loop, and
   *     counting it would fail an answer the learner wrote correctly.
   *   - `struktur` asks "is the column named judul and typed string?". In Laravel that name
   *     LIVES in a string literal. Blanking it leaves nothing to check but method names, which
   *     would let `$table->string('apapun')` pass an exercise about a specific column.
   *
   * The cost is accepted openly: `$x = "Schema::create('catatan')"` would satisfy a structural
   * assertion. That takes deliberate effort, produces code that plainly does not work, and the
   * learner would only be fooling themselves. Comments stay blanked either way, which is the
   * accidental false positive that actually happens.
   */
  keepStrings?: boolean;
};

export function normalizeSource(
  source: string,
  language: SourceLanguage,
  options: NormalizeOptions = {},
): string {
  const keepStrings = options.keepStrings === true;
  const out: string[] = [];
  const stack: Frame[] = [{ state: { kind: 'code' }, braceDepth: 0 }];

  const top = (): Frame => stack[stack.length - 1] as Frame;
  const keep = (char: string): void => void out.push(char);
  const blank = (char: string): void => void out.push(char === '\n' ? '\n' : ' ');

  let i = 0;
  while (i < source.length) {
    const frame = top();
    const char = source[i] as string;
    const next = source[i + 1];

    switch (frame.state.kind) {
      case 'code': {
        // `//` opens a line comment in JavaScript and PHP, and in CSS it opens nothing at all —
        // but it does appear in every absolute `url(https://…)`. Treating it as a comment there
        // would blank the rest of the rule, including the declaration being asserted on.
        if ((language === 'js' || language === 'php') && char === '/' && next === '/') {
          frame.state = { kind: 'line-comment' };
          blank(char);
          blank(next as string);
          i += 2;
          continue;
        }
        // SQL's line comment. Checked before strings so `--` inside a quote is never reached here.
        if (language === 'sql' && char === '-' && next === '-') {
          frame.state = { kind: 'line-comment' };
          blank(char);
          blank(next as string);
          i += 2;
          continue;
        }
        if (language === 'php' && char === '#') {
          // PHP 8 attributes start `#[` and are code, not a comment.
          if (next !== '[') {
            frame.state = { kind: 'line-comment' };
            blank(char);
            i += 1;
            continue;
          }
        }
        if (char === '/' && next === '*') {
          frame.state = { kind: 'block-comment' };
          blank(char);
          blank(next as string);
          i += 2;
          continue;
        }
        if (char === '"' || char === "'") {
          frame.state = { kind: 'quote', quote: char };
          if (keepStrings) keep(char);
          else blank(char);
          i += 1;
          continue;
        }
        if (language === 'js' && char === '`') {
          frame.state = { kind: 'template' };
          if (keepStrings) keep(char);
          else blank(char);
          i += 1;
          continue;
        }
        if (language === 'php' && char === '<' && source.startsWith('<<<', i)) {
          const header = /^<<<[ \t]*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1\r?\n/.exec(source.slice(i));
          if (header) {
            const quote = header[1] as string;
            frame.state = {
              kind: 'heredoc',
              id: header[2] as string,
              interpolating: quote !== "'",
            };
            for (const c of header[0]) blank(c);
            i += header[0].length;
            continue;
          }
        }
        // Inside a `${…}` the closing brace hands control back to the template.
        if (char === '{') frame.braceDepth += 1;
        if (char === '}') {
          if (frame.braceDepth === 0 && stack.length > 1) {
            stack.pop();
            if (keepStrings) keep(char);
            else blank(char);
            i += 1;
            continue;
          }
          frame.braceDepth -= 1;
        }
        keep(char);
        i += 1;
        continue;
      }

      case 'line-comment': {
        if (char === '\n') frame.state = { kind: 'code' };
        blank(char);
        i += 1;
        continue;
      }

      case 'block-comment': {
        if (char === '*' && next === '/') {
          frame.state = { kind: 'code' };
          blank(char);
          blank(next as string);
          i += 2;
          continue;
        }
        blank(char);
        i += 1;
        continue;
      }

      case 'quote': {
        const emit = keepStrings ? keep : blank;
        if (char === '\\') {
          emit(char);
          if (next !== undefined) emit(next);
          i += 2;
          continue;
        }
        if (char === frame.state.quote) frame.state = { kind: 'code' };
        emit(char);
        i += 1;
        continue;
      }

      case 'template': {
        // Same rule as quoted strings: kept verbatim when asked. A SQL query written as a template
        // literal must expose both its `$1` placeholder and any `${...}` interpolation, because
        // telling those two apart is exactly what an injection exercise checks.
        const emit = keepStrings ? keep : blank;
        if (char === '\\') {
          emit(char);
          if (next !== undefined) emit(next);
          i += 2;
          continue;
        }
        if (char === '$' && next === '{') {
          emit(char);
          emit(next as string);
          stack.push({ state: { kind: 'code' }, braceDepth: 0 });
          i += 2;
          continue;
        }
        if (char === '`') frame.state = { kind: 'code' };
        emit(char);
        i += 1;
        continue;
      }

      case 'heredoc': {
        if (char === '\n') {
          // A heredoc ends at the first line whose only content is the identifier. PHP 7.3+
          // allows that line to be indented, and the closer may be followed by `;` or `,`.
          const rest = source.slice(i + 1);
          const closer = new RegExp(`^([ \\t]*)${frame.state.id}\\b`).exec(rest);
          if (closer) {
            const consumed = closer[0].length;
            blank(char);
            for (let k = 0; k < consumed; k += 1) blank(' ');
            frame.state = { kind: 'code' };
            i += 1 + consumed;
            continue;
          }
        }
        if (frame.state.interpolating && char === '$' && next === '{') {
          blank(char);
          blank(next as string);
          stack.push({ state: { kind: 'code' }, braceDepth: 0 });
          i += 2;
          continue;
        }
        blank(char);
        i += 1;
        continue;
      }
    }
  }

  return out.join('');
}

/** Lines that still hold code after normalization — what `maks-baris` counts. */
export function countCodeLines(source: string, language: SourceLanguage): number {
  return normalizeSource(source, language)
    .split('\n')
    .filter((line) => line.trim().length > 0).length;
}
