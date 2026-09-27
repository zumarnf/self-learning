import { compareOutput, deepEqual, display } from './compare';
import type { Scenario, ScenarioResult } from './types';

/**
 * The seam between grading and execution.
 *
 * Two implementations exist — a Web Worker in the browser and `node:vm` in tests — and the whole
 * point of this interface is that they must never reach different verdicts on the same code. So
 * everything that *decides* anything lives here, in code both of them import. An implementation
 * only supplies one capability: turn a source string into a value, capturing what it printed.
 */

export type RunRequest = {
  code: string;
  scenarios: Scenario[];
  /** Total budget in milliseconds. Exceeding it cancels the whole run. */
  timeoutMs: number;
};

export type RunResponse =
  | { status: 'ok'; results: ScenarioResult[]; consoleOutput: string[] }
  | { status: 'timeout' }
  | { status: 'crash'; message: string };

export interface ExerciseRunner {
  run(request: RunRequest): Promise<RunResponse>;
  dispose(): void;
}

/** Raised by an implementation when the host cancelled execution on time. */
export class ExecutionTimeout extends Error {
  constructor() {
    super('Waktu eksekusi habis.');
    this.name = 'ExecutionTimeout';
  }
}

/** Raised when the source could not be parsed at all — a different problem from a wrong answer. */
export class SourceSyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SourceSyntaxError';
  }
}

/**
 * Format `console.log(...)` arguments the way a terminal would.
 *
 * Strings print bare and everything else is inspected, so an exercise expecting `['5']` matches
 * `console.log(5)` while still telling `5` apart from `'5'` in a failure row.
 */
export function formatConsoleArgs(args: unknown[]): string {
  return args.map((arg) => (typeof arg === 'string' ? arg : display(arg))).join(' ');
}

/**
 * Build the exact source an implementation evaluates for one scenario.
 *
 * Wrapped in an IIFE for two reasons: `return` needs a function to live in, and the learner's
 * `const` declarations must not leak from one scenario into the next. Strict mode is forced so an
 * accidental undeclared assignment fails loudly instead of quietly creating a global.
 */
export function buildScenarioSource(code: string, scenario: Scenario): string {
  const expression = scenario.expect.type === 'nilai' ? scenario.expect.expression : 'undefined';

  return [
    '(function () {',
    "'use strict';",
    scenario.prelude ?? '',
    code,
    `;return (${expression});`,
    '})()',
  ].join('\n');
}

/** The name/message pair an Error survives as once it has crossed `postMessage`. */
export type ErrorParts = { name: string; message: string };

/**
 * Reduce a thrown value to one readable line. Never a stack trace (`security.md`).
 *
 * Split from `describeError` so the Worker path and the Node path produce identical wording: an
 * Error does not survive structured cloning with its formatting intact, so the Worker sends the
 * two fields and the main thread formats them here — the same function, one rule.
 */
export function describeErrorParts({ name, message }: ErrorParts): string {
  if (name.length === 0) return message;
  return message.length > 0 ? `${name}: ${message}` : name;
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return describeErrorParts({ name: error.name, message: error.message });
  }
  return typeof error === 'string' ? error : display(error);
}

/**
 * Decide whether one scenario passed, given what running it produced.
 *
 * Shared on purpose: this is the function that guarantees the browser and the test suite agree.
 */
export function judgeScenario(
  scenario: Scenario,
  outcome: { lines: string[]; value: unknown; error?: string },
): ScenarioResult {
  const base = { id: scenario.id, name: scenario.name, visible: scenario.visible };

  if (outcome.error !== undefined) {
    return {
      ...base,
      passed: false,
      expectedDisplay:
        scenario.expect.type === 'output'
          ? scenario.expect.lines.join('\n')
          : display(scenario.expect.equals),
      actualDisplay: outcome.error,
      error: outcome.error,
    };
  }

  if (scenario.expect.type === 'output') {
    return {
      ...base,
      passed: compareOutput(outcome.lines, scenario.expect.lines),
      expectedDisplay: scenario.expect.lines.join('\n'),
      actualDisplay: outcome.lines.join('\n'),
    };
  }

  return {
    ...base,
    passed: deepEqual(outcome.value, scenario.expect.equals),
    expectedDisplay: display(scenario.expect.equals),
    actualDisplay: display(outcome.value),
  };
}
