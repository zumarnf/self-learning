/**
 * Pattern builders shared by the structural SQL exercises.
 *
 * They exist because the obvious way to write these checks is catastrophically slow. Structural
 * grading runs on the main thread, and a chain of lazy scans such as
 * `select[\s\S]*?nama[\s\S]*?from` backtracks quadratically whenever the text never reaches the
 * final token: 20,000 characters of `select nama ` froze the grader for eleven seconds. Each
 * builder below is linear per starting keyword, and `taman-bermain-integrity.test.ts` times every
 * pattern in the bank against hostile input so a slow one cannot be merged.
 *
 * Patterns are lower case because `checkStructure` folds SQL to lower case outside strings.
 */

/** Everything up to, but not past, the first `from` — the extent of a SELECT list. */
const SEBELUM_FROM = '(?:(?!\\bfrom\\b)[\\s\\S])*?';

/**
 * Every named column appears in a SELECT list, in any order, and a `FROM` follows.
 *
 * One lookahead per column instead of a chain, and lookaheads are atomic in JavaScript, so a
 * failed column never makes the engine retry the ones before it.
 */
export function kolomDiSelect(kolom: string[], dariTabel?: string): string {
  const semuaKolom = kolom.map((k) => `(?=${SEBELUM_FROM}\\b${k}\\b)`).join('');
  const from = dariTabel === undefined ? '\\bfrom\\b' : `\\bfrom\\s+${dariTabel}\\b`;
  return `\\bselect\\s${semuaKolom}(?=[\\s\\S]*?${from})`;
}

/**
 * The anti-join shape: a `LEFT`/`RIGHT JOIN`, then a `WHERE`, then `<column> IS NULL`.
 *
 * Anchored at the start and pinned with `(?=(…))\1`, which emulates an atomic group: only the
 * FIRST such join and the first `WHERE` after it are considered. That loses nothing — an
 * `IS NULL` after any later `WHERE` is also after the first one — and it means the engine never
 * re-scans the text once per join and once per `WHERE`, which is what made the naive version cubic.
 */
export function antiJoinIsNull(kolomNull: string): string {
  return (
    '^(?=([\\s\\S]*?\\b(?:left|right)\\s+(?:outer\\s+)?join\\b))\\1' +
    '(?=([\\s\\S]*?\\bwhere\\s))\\2' +
    `[\\s\\S]*?\\b(?:\\w+\\.)?(?:${kolomNull})\\s+is\\s+null\\b`
  );
}
