import { checkConstraints, checkStructure } from './check';
import type { ExerciseRunner } from './runner';
import type { CheckResult, CheckSpec } from './types';

/**
 * The whole of grading, in one pure-ish function.
 *
 * "Pure-ish" because the runner is injected rather than reached for. That single decision is what
 * lets a Node test call exactly the same grader the browser calls, which in turn is what makes it
 * possible to prove in CI that every answer key in the bank passes its own grader (PRD §7 R-1).
 * A grader welded to `Worker` would leave 40 answer keys resting on nobody having slipped.
 */

/** Two seconds. Long enough for any exercise here, short enough that a hung loop is not a hang. */
const DEFAULT_TIMEOUT_MS = 2000;

export async function grade(
  check: CheckSpec,
  code: string,
  runner: ExerciseRunner,
  options: { timeoutMs?: number } = {},
): Promise<CheckResult> {
  if (check.engine === 'struktur') {
    const rows = checkStructure(code, check.assertions, check.bahasa);
    return {
      passed: rows.every((row) => row.passed),
      engine: 'struktur',
      constraints: rows,
      scenarios: [],
      // Not a failure — this engine never executes, and the UI says so rather than showing an
      // empty scenario box the reader has to interpret (PRD §7 R-3).
      skipReason: 'tanpa-eksekusi',
      consoleOutput: [],
    };
  }

  const constraints = checkConstraints(code, check.constraints, 'js');

  // Short-circuit on purpose. If the answer broke a rule the exercise stated in prose, running it
  // adds nothing: the output may well be correct, and saying so would only muddy the message.
  if (constraints.some((row) => !row.passed)) {
    return {
      passed: false,
      engine: 'js',
      constraints,
      scenarios: [],
      skipReason: 'batasan-gagal',
      consoleOutput: [],
    };
  }

  const outcome = await runner.run({
    code,
    scenarios: check.scenarios,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  });

  if (outcome.status === 'timeout') {
    return {
      passed: false,
      engine: 'js',
      constraints,
      scenarios: [],
      skipReason: 'timeout',
      message:
        'Kodemu berjalan terlalu lama lalu dihentikan. Periksa kondisi berhenti pada loop-mu.',
      consoleOutput: [],
    };
  }

  if (outcome.status === 'crash') {
    return {
      passed: false,
      engine: 'js',
      constraints,
      scenarios: [],
      skipReason: 'crash',
      message: outcome.message,
      consoleOutput: [],
    };
  }

  return {
    passed: outcome.results.every((row) => row.passed),
    engine: 'js',
    constraints,
    scenarios: outcome.results,
    consoleOutput: outcome.consoleOutput,
  };
}
