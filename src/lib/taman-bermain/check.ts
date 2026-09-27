import { countCodeLines, normalizeSource } from './normalize';
import type { Constraint, RowResult, SourceLanguage, StructuralAssertion } from './types';

/**
 * Layer 1 of grading: rules about the *shape* of an answer, evaluated without running it.
 *
 * Behaviour alone cannot express "must use a for loop" — printing five numbers by hand produces
 * exactly the expected output. Nor can it express "no functions allowed", since a `forEach` gets
 * the same result as a loop. Those are the rules an exercise states in prose, so something has to
 * enforce them, and this is it (PRD §2.2).
 *
 * Everything here matches against NORMALIZED source, never raw text. See `normalize.ts` for why
 * that distinction is the difference between a grader that works and one that blames the learner
 * for the grader's own mistakes.
 */

/** A pattern that will not compile is a defect in the exercise, not in the answer. */
function compile(pattern: string, flags: string | undefined): RegExp | undefined {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return undefined;
  }
}

/**
 * Fail closed on a broken pattern.
 *
 * The integrity test compiles every pattern in the bank, so reaching this means an exercise
 * shipped broken. Failing the row with an honest message beats throwing: a learner who typed a
 * correct answer should see a grader problem, not a blank page (`security.md` — fail closed).
 */
function brokenPattern(id: string, label: string): RowResult {
  return {
    id,
    label,
    passed: false,
    detail: 'Soal ini punya pola pemeriksaan yang rusak, jadi jawabanmu tidak bisa dinilai.',
  };
}

export function checkConstraints(
  source: string,
  constraints: Constraint[],
  language: SourceLanguage,
): RowResult[] {
  const normalized = normalizeSource(source, language);

  return constraints.map(({ id, label, rule }): RowResult => {
    if (rule.type === 'maks-baris') {
      const lines = countCodeLines(source, language);
      return lines <= rule.value
        ? { id, label, passed: true }
        : {
            id,
            label,
            passed: false,
            detail: `Kodemu ${lines} baris, sementara soal ini membatasi ${rule.value} baris kode.`,
          };
    }

    const regex = compile(rule.pattern, rule.flags);
    if (!regex) return brokenPattern(id, label);

    const found = regex.test(normalized);

    if (rule.type === 'wajib-ada') {
      return found
        ? { id, label, passed: true }
        : { id, label, passed: false, detail: 'Belum terlihat di kodemu.' };
    }

    return found
      ? {
          id,
          label,
          passed: false,
          detail: 'Masih terpakai di kodemu, padahal soal ini melarangnya.',
        }
      : { id, label, passed: true };
  });
}

/**
 * The whole of grading for the `struktur` engine.
 *
 * What this can promise is narrower than the `js` engine and the UI says so: it proves the answer
 * has the right *shape*, not that it would run (SDD §4.5). Its `hint` field carries the weight —
 * without execution there is no "expected vs got" to show, so the hint is the only thing standing
 * between the learner and a bare "salah".
 */
/**
 * Lower-case SQL everywhere except inside single-quoted string literals.
 *
 * Keywords and unquoted identifiers are case-insensitive in PostgreSQL, so `SELECT` and `select`
 * must grade the same. String contents are not: `kota = 'bandung'` returns no rows when the data
 * says 'Bandung'. A regex `i` flag cannot tell the two apart, which is why this folds the source
 * instead — and why SQL patterns are written in lower case outside their quotes.
 *
 * Toggling on every quote is enough: the `''` escape closes and immediately reopens the string,
 * leaving nothing between. Comments are already blanked by the normalizer, so an apostrophe in a
 * comment cannot flip the state.
 */
function foldSqlCase(normalized: string): string {
  let insideString = false;
  let folded = '';
  for (const char of normalized) {
    if (char === "'") insideString = !insideString;
    folded += insideString ? char : char.toLowerCase();
  }
  return folded;
}

export function checkStructure(
  source: string,
  assertions: StructuralAssertion[],
  language: SourceLanguage,
): RowResult[] {
  // Strings are KEPT here, unlike in `checkConstraints`. Table and column names in Laravel live
  // inside string literals, and an exercise about the `judul` column has nothing left to check
  // without them. See `NormalizeOptions.keepStrings` for the tradeoff that buys.
  const kept = normalizeSource(source, language, { keepStrings: true });
  const normalized = language === 'sql' ? foldSqlCase(kept) : kept;

  return assertions.map(({ id, label, hint, rule }): RowResult => {
    if (rule.type === 'berurutan') {
      // Walk forward: each pattern must match after the previous one ended. Some Laravel shapes
      // are only correct in order — `with()` after `get()` is valid PHP that does nothing.
      let cursor = 0;
      for (const pattern of rule.patterns) {
        const regex = compile(pattern, 'g');
        if (!regex) return brokenPattern(id, label);
        regex.lastIndex = cursor;
        const match = regex.exec(normalized);
        if (!match) return { id, label, passed: false, detail: hint };
        cursor = match.index + match[0].length;
      }
      return { id, label, passed: true };
    }

    const regex = compile(rule.pattern, rule.flags);
    if (!regex) return brokenPattern(id, label);

    const found = regex.test(normalized);
    const wants = rule.type === 'wajib-ada';

    return found === wants
      ? { id, label, passed: true }
      : { id, label, passed: false, detail: hint };
  });
}
