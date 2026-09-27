/**
 * How the grader decides two values are the same, and how it shows them side by side.
 *
 * These rules are part of the exercise-authoring contract: an author writing `equals: [3, 2, 1]`
 * has to be able to predict what will and will not match. They live in one module so the browser
 * Worker and the Node test runner can never disagree about a verdict (SDD §5.4) — two graders
 * reaching different answers on the same code would be the worst possible bug here, because it
 * would only ever show up for the learner.
 */

/** Longest rendered value shown in a result row before it is cut. */
const MAX_DISPLAY = 200;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Structural equality with the two adjustments this domain needs.
 *
 * `Object.is` rather than `===` at the leaves, because the two cases where they differ are both
 * cases a learner hits: `NaN === NaN` is false, which would make a correct "no numeric answer"
 * result unmatchable, and `0 === -0` is true, which would hide a real sign bug.
 *
 * Array order matters; object key order does not. That asymmetry is not an oversight — reversing
 * a list is an exercise, and writing an object's keys in a different order never is.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Compare captured console output against what the exercise expects.
 *
 * Trailing whitespace and trailing blank lines are noise from how the code happened to print, not
 * from what it computed, so they are ignored. A blank line in the *middle* is not ignored: an
 * exercise that prints a separator between groups is testing exactly that.
 */
export function compareOutput(actual: string[], expected: string[]): boolean {
  const tidy = (lines: string[]): string[] => {
    const trimmed = lines.map((line) => line.trim());
    let end = trimmed.length;
    while (end > 0 && trimmed[end - 1] === '') end -= 1;
    return trimmed.slice(0, end);
  };

  const a = tidy(actual);
  const b = tidy(expected);
  return a.length === b.length && a.every((line, index) => line === b[index]);
}

/**
 * Render a value for the "diharapkan / didapat" rows.
 *
 * Deliberately not `JSON.stringify`: it turns `undefined` and `NaN` into `null`, and those two
 * are the most informative values a failing answer can produce. A learner staring at
 * `didapat: null` has been robbed of the clue that would have solved it.
 */
export function display(value: unknown, options: { sortKeys?: boolean } = {}): string {
  const rendered = render(value, new WeakSet(), options.sortKeys ?? true);
  return rendered.length > MAX_DISPLAY ? `${rendered.slice(0, MAX_DISPLAY)}…` : rendered;
}

function render(value: unknown, seen: WeakSet<object>, sortKeys: boolean): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  if (typeof value === 'function') return `[Function ${value.name || 'anonim'}]`;
  if (typeof value === 'symbol') return value.toString();

  const object = value as object;
  if (seen.has(object)) return '[melingkar]';
  seen.add(object);

  if (Array.isArray(value)) {
    return `[${value.map((item) => render(item, seen, sortKeys)).join(', ')}]`;
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Map) {
    const entries = [...value.entries()].map(
      ([k, v]) => `${render(k, seen, sortKeys)} => ${render(v, seen, sortKeys)}`,
    );
    return `Map(${entries.join(', ')})`;
  }
  if (value instanceof Set) {
    return `Set(${[...value].map((item) => render(item, seen, sortKeys)).join(', ')})`;
  }

  // Keys are sorted by default so two objects that differ in one field produce diffs that line up.
  // Worked examples turn it off: there the author's order ({ id, nama, anak }) reads naturally,
  // and alphabetical order ({ anak, id, nama }) only looks like a different shape.
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const body = (sortKeys ? keys.sort() : keys)
    .map((key) => `${key}: ${render(record[key], seen, sortKeys)}`)
    .join(', ');
  return body.length === 0 ? '{}' : `{ ${body} }`;
}
