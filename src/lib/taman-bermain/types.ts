import type { CodeLang, TermEntry } from '@/lib/content/types';
import type { CategorySlug } from '@/lib/curriculum/types';

/**
 * Shape of a Taman Bermain exercise and of everything needed to grade an answer.
 *
 * The discriminator is `engine` on `CheckSpec`, mirroring the `kind` discriminator on `Block`
 * (ADR-0003). Two engines exist in v1 and they differ in what they can promise: `js` runs the
 * learner's code and checks what it actually does, while `struktur` only inspects the source and
 * therefore cannot prove the code would run. That asymmetry is deliberate and is surfaced to the
 * reader rather than hidden (SDD §4.5).
 */

/** Two tiers only, using the vocabulary the curriculum already uses (PRD §2.5). */
export type Level = 'basic' | 'intermediate';

/**
 * Languages the source normalizer knows how to strip comments and string literals from.
 *
 * `css` is not a subset of the other two and cannot be treated as one: `//` is not a comment in
 * CSS but appears in every absolute `url(...)`, `#` opens an id selector rather than a comment,
 * and a backtick has no meaning at all. Each of those would silently eat the rest of a line or a
 * file if the JavaScript or PHP rules were applied to it.
 *
 * `sql` has its own line comment, `--`, and nothing else from the other two: `#` is the bitwise
 * XOR operator in PostgreSQL and `//` never appears outside a string. Its keywords and unquoted
 * identifiers are case-insensitive while string contents are not, so `checkStructure` lower-cases
 * SQL outside single-quoted strings — and SQL patterns are written in lower case outside quotes.
 */
export type SourceLanguage = 'js' | 'php' | 'css' | 'sql';

/* ------------------------------------------------------------- layer 1: rules */

/**
 * A rule about the *shape* of the answer, checked against normalized source without running it.
 *
 * This is the layer that makes "must use a for loop, no functions allowed" enforceable. Behaviour
 * alone cannot express it: printing five numbers by hand produces the correct output.
 */
export type Constraint = {
  id: string;
  /** Sentence the learner reads on the result row. Written as a requirement, not a scolding. */
  label: string;
  rule: ConstraintRule;
};

export type ConstraintRule =
  | { type: 'wajib-ada'; pattern: string; flags?: string }
  | { type: 'dilarang'; pattern: string; flags?: string }
  | { type: 'maks-baris'; value: number };

/* --------------------------------------------------------- layer 2: behaviour */

/**
 * One test case for the learner's code.
 *
 * `visible` scenarios are printed in the exercise as worked examples; hidden ones only appear
 * after a check. Without hidden cases a learner can tune the code to the printed example rather
 * than solve the problem (PRD §2.3).
 */
export type Scenario = {
  id: string;
  name: string;
  visible: boolean;
  /** Runs before the learner's code — this is where a scenario's input is defined. */
  prelude?: string;
  expect: ScenarioExpectation;
};

export type ScenarioExpectation =
  /** Compare captured `console.log` lines. For exercises that print. */
  | { type: 'output'; lines: string[] }
  /** Evaluate an expression after the learner's code has run. For exercises that define things. */
  | { type: 'nilai'; expression: string; equals: unknown };

/* ------------------------------------------------ structural engine (Laravel) */

/**
 * A rule about source that is never executed.
 *
 * `berurutan` exists because some Laravel shapes are only correct in order — a column defined
 * after `timestamps()` is still valid PHP but reads wrong, and eager loading placed after a
 * `get()` does nothing at all.
 */
export type StructuralAssertion = {
  id: string;
  label: string;
  /** Shown when this row fails. Must point at what is missing, never just restate the label. */
  hint: string;
  rule:
    | { type: 'wajib-ada'; pattern: string; flags?: string }
    | { type: 'dilarang'; pattern: string; flags?: string }
    | { type: 'berurutan'; patterns: string[] };
};

/* ----------------------------------------------------------------- check spec */

export type CheckSpec =
  | { engine: 'js'; constraints: Constraint[]; scenarios: Scenario[] }
  | { engine: 'struktur'; bahasa: SourceLanguage; assertions: StructuralAssertion[] };

export type Engine = CheckSpec['engine'];

/* ---------------------------------------------------------------------- brief */

/** Code that already exists and must be USED, not rewritten — e.g. a component in another file. */
export type GivenCode = {
  /** Where it lives, as the learner would see it in a real project: `src/components/ui/button.tsx`. */
  file: string;
  lang: CodeLang;
  code: string;
};

/**
 * What the learner reads before writing anything, split into fixed sections.
 *
 * Fixed rather than free prose because what makes a beginner fast is not better sentences but
 * knowing WHERE to look: "what do I have to write" is always in the same place. The order follows
 * the curriculum's rule of concrete first, definitions later — a situation the reader can picture,
 * then the task, then the traps.
 */
export type Brief = {
  /** A real situation the reader can imagine. Never a definition. */
  situation: string;
  /** Exactly what to write, one checkable thing per item: names, inputs, outputs. */
  tasks: string[];
  given?: GivenCode;
  /** What is easy to miss, each with the reason it matters. */
  pitfalls: string[];
  /** English terms this exercise uses, explained for a beginner (ADR-0006 pattern). */
  terms: TermEntry[];
};

/**
 * The answer key, written to be learned from rather than copied.
 *
 * `steps` walks through how the code works in order; `explanation` is the one idea worth keeping.
 * The alternative and rejected answers on `Exercise` are shown next to it as "other correct ways"
 * and "common mistakes" — they are already proved by CI, so showing them costs nothing and answers
 * the question every beginner has after reading a model answer: was my different version wrong?
 */
export type Solution = {
  code: string;
  steps: string[];
  explanation: string;
};

/* ------------------------------------------------------------------- exercise */

export type Exercise = {
  /** Stable forever — it is both the URL and the storage key. */
  slug: string;
  title: string;
  /** Filter bucket, e.g. 'daftar', 'async', 'skema'. */
  topic: string;
  level: Level;
  /**
   * Where this logic shows up in a real project, in one sentence.
   *
   * Required, and enforced by the integrity test. It is the mechanism behind the selection rule
   * in PRD §2.5: an exercise whose author cannot say when it is used does not belong in the bank.
   * It is also shown on the card, so the cost of writing it is paid straight back to the reader.
   */
  realWorldUse: string;
  /** Chapter this came from. Verified against the real curriculum by the integrity test. */
  source: { category: CategorySlug; chapter: string };
  brief: Brief;
  /** Rules as the learner reads them. Each one must have an enforcer in `check`. */
  rules: string[];
  starter: string;
  /** Opened one at a time, vaguest first. */
  hints: string[];
  solution: Solution;
  /**
   * Highlighting language for the answer key and its variants. Defaults from the engine; set it
   * when that default is wrong — JSX graded by the `js` structural engine should highlight as JSX.
   */
  codeLang?: CodeLang;
  /** Other correct answers that MUST pass. This is "many ways to be right", made testable. */
  alternativeSolutions: string[];
  /** Answers that MUST fail, and why. This is what proves the grader actually bites. */
  rejectedSolutions: { code: string; reason: string }[];
  check: CheckSpec;
};

/** What the index page is allowed to receive — no solutions, no check spec (SDD §2.2). */
export type ExerciseSummary = {
  slug: string;
  title: string;
  topic: string;
  level: Level;
  realWorldUse: string;
  engine: Engine;
  source: { category: CategorySlug; chapter: string };
};

/* -------------------------------------------------------------------- results */

export type RowResult = {
  id: string;
  label: string;
  passed: boolean;
  /** Only when failed. Explains what is missing rather than restating the label. */
  detail?: string;
};

export type ScenarioResult = {
  id: string;
  name: string;
  visible: boolean;
  passed: boolean;
  expectedDisplay: string;
  actualDisplay: string;
  /** Present when the code threw rather than merely returning something else. */
  error?: string;
};

/**
 * Why the scenario section is empty or incomplete.
 *
 * `batasan-gagal` is not a failure of the run — it is the grader short-circuiting on purpose
 * (SDD §5.2), and the UI says so rather than showing an empty box.
 */
export type ScenarioSkipReason = 'batasan-gagal' | 'timeout' | 'crash' | 'tanpa-eksekusi';

export type CheckResult = {
  passed: boolean;
  engine: Engine;
  constraints: RowResult[];
  scenarios: ScenarioResult[];
  skipReason?: ScenarioSkipReason;
  /** Runtime message for `crash`, or the timeout notice. Never a raw stack trace. */
  message?: string;
  /** Everything the code printed, across all scenarios, for the output panel. */
  consoleOutput: string[];
};
