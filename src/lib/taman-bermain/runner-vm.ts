import { createContext, Script } from 'node:vm';
import {
  buildScenarioSource,
  describeError,
  formatConsoleArgs,
  judgeScenario,
  type ExerciseRunner,
  type RunRequest,
  type RunResponse,
} from './runner';
import type { ScenarioResult } from './types';

/**
 * Node-side runner. TEST ONLY — never imported by anything the browser loads.
 *
 * It exists so the grader can be called from a test at all, which is what makes PRD §7 R-1
 * enforceable: every exercise's official answer, every listed alternative, and every answer that
 * must be rejected are run through the real grader in CI. Without a Node runner, the correctness
 * of 40 answer keys would rest on nobody having made a mistake.
 *
 * `node:vm` is used rather than jsdom + `new Function` for one reason that matters: it takes a
 * real `timeout`, so an exercise whose answer key loops forever fails the suite instead of
 * hanging it.
 */

/** Host APIs the sandbox gets. Deliberately small — this is not a browser and not Node. */
type Timer = ReturnType<typeof setTimeout>;

function createSandbox(capture: (line: string) => void, timers: Set<Timer>): object {
  const track = <A extends unknown[]>(fn: (...args: A) => Timer) => {
    return (...args: A): Timer => {
      const id = fn(...args);
      timers.add(id);
      return id;
    };
  };

  const noop = (): void => {};
  const log = (...args: unknown[]): void => capture(formatConsoleArgs(args));

  return {
    console: { log, info: log, warn: log, error: log, debug: log, table: noop, trace: noop },
    setTimeout: track(setTimeout),
    setInterval: track(setInterval),
    clearTimeout: (id: Timer): void => {
      timers.delete(id);
      clearTimeout(id);
    },
    clearInterval: (id: Timer): void => {
      timers.delete(id);
      clearInterval(id);
    },
    queueMicrotask,
    structuredClone,
    // Host APIs a Worker has and a bare vm context does not. Parity here is not a nicety: an
    // exercise that uses URLSearchParams would pass in the browser and throw ReferenceError in
    // CI, which is exactly the "two graders disagreeing" failure this design exists to prevent.
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
  };
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

/** A promise that never settles must not become a test that never ends. */
const TIMED_OUT = Symbol('timeout');

async function settleWithin(value: PromiseLike<unknown>, ms: number): Promise<unknown> {
  let timer: Timer | undefined;
  const guard = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMED_OUT), ms);
  });
  try {
    return await Promise.race([value, guard]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function createVmRunner(): ExerciseRunner {
  return {
    async run({ code, scenarios, timeoutMs }: RunRequest): Promise<RunResponse> {
      const results: ScenarioResult[] = [];
      const consoleOutput: string[] = [];
      const deadline = Date.now() + timeoutMs;

      for (const scenario of scenarios) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) return { status: 'timeout' };

        const source = buildScenarioSource(code, scenario);

        // Compiling separately is what tells a syntax error apart from a wrong answer. One is a
        // problem with the code as text; the other is a problem with what the code does, and the
        // learner needs to be told which.
        let script: Script;
        try {
          script = new Script(source);
        } catch (error) {
          return { status: 'crash', message: describeError(error) };
        }

        const lines: string[] = [];
        const timers = new Set<Timer>();
        const sandbox = createContext(createSandbox((line) => lines.push(line), timers));

        let value: unknown;
        let failure: string | undefined;

        try {
          value = script.runInContext(sandbox, { timeout: remaining });
          if (isThenable(value)) {
            const settled = await settleWithin(value, Math.max(deadline - Date.now(), 0));
            if (settled === TIMED_OUT) return { status: 'timeout' };
            value = settled;
          }
        } catch (error) {
          // vm signals its own timeout with a coded error; everything else is the learner's bug
          // inside one scenario and must not take the other scenarios down with it.
          const code_ = (error as { code?: string }).code;
          if (
            code_ === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ||
            code_ === 'ERR_SCRIPT_EXECUTION_INTERRUPTED'
          ) {
            return { status: 'timeout' };
          }
          failure = describeError(error);
        } finally {
          for (const id of timers) {
            clearTimeout(id);
            clearInterval(id);
          }
        }

        consoleOutput.push(...lines);
        results.push(
          judgeScenario(scenario, {
            lines,
            value,
            ...(failure === undefined ? {} : { error: failure }),
          }),
        );
      }

      return { status: 'ok', results, consoleOutput };
    },

    dispose(): void {
      // Each scenario builds and drops its own context; there is nothing long-lived to release.
    },
  };
}
