'use client';

import {
  buildScenarioSource,
  describeErrorParts,
  formatConsoleArgs,
  judgeScenario,
  type ErrorParts,
  type ExerciseRunner,
  type RunRequest,
  type RunResponse,
} from './runner';
import type { ScenarioResult } from './types';
import { WORKER_SOURCE } from './worker-source';

/**
 * Browser-side runner: a Web Worker that can be killed on time.
 *
 * The Worker is built from a Blob rather than from a module file. That is not a preference —
 * SDD §5.3 named it as the fallback, and spike F1-2 showed the module path does not work here:
 * Turbopack emits the worker file as a raw `.ts` asset the browser cannot parse. See
 * `worker-source.ts` for the evidence and for why the fallback ends up being the better shape.
 *
 * The division of labour matters more than the mechanism. The Worker executes and reports raw
 * observations; everything that DECIDES anything runs here, through the same functions
 * `runner-vm.ts` calls in Node. That is what makes it impossible for a learner's browser and the
 * test suite to reach different verdicts on the same code.
 *
 * The timeout is enforced from out here, never from inside the Worker. Code stuck in
 * `while (true)` never reaches a line that could report itself; the only thing that stops it is
 * someone pulling the plug, which is exactly what `terminate()` does.
 */

type WorkerOutcome = {
  /** One entry per `console` call, each already safe to structured-clone. */
  args: unknown[][];
  value: unknown;
  error?: ErrorParts;
};

type WorkerReply =
  | { id: number; status: 'ok'; outcomes: WorkerOutcome[] }
  | { id: number; status: 'crash'; error: ErrorParts };

/**
 * Validate a reply before trusting its shape.
 *
 * The Worker is a TRUST BOUNDARY, and it became one the moment it started executing code the
 * learner typed. That code can close the IIFE it is wrapped in and call `self.postMessage` with
 * whatever it likes. In this app's threat model that buys nothing — the only person it deceives
 * is the person who typed it — but an unchecked `outcomes.map()` on a crafted payload throws
 * inside the message handler, the promise never settles, and the reader waits out the full
 * timeout for what should be an instant, clear failure.
 *
 * `security.md`: validate everything crossing a trust boundary. Cheap here, and it converts a
 * two-second hang into an honest message.
 */
function parseReply(data: unknown, expectedId: number): WorkerReply | undefined {
  if (typeof data !== 'object' || data === null) return undefined;
  const reply = data as Record<string, unknown>;
  if (reply.id !== expectedId) return undefined;

  if (reply.status === 'crash') {
    const error = reply.error as Record<string, unknown> | undefined;
    return {
      id: expectedId,
      status: 'crash',
      error: {
        name: typeof error?.name === 'string' ? error.name : '',
        message: typeof error?.message === 'string' ? error.message : 'Kode gagal dijalankan.',
      },
    };
  }

  if (reply.status !== 'ok' || !Array.isArray(reply.outcomes)) return undefined;

  const outcomes: WorkerOutcome[] = [];
  for (const raw of reply.outcomes) {
    if (typeof raw !== 'object' || raw === null) return undefined;
    const outcome = raw as Record<string, unknown>;
    if (!Array.isArray(outcome.args)) return undefined;
    if (!outcome.args.every((entry) => Array.isArray(entry))) return undefined;

    const error = outcome.error as Record<string, unknown> | undefined;
    outcomes.push({
      args: outcome.args as unknown[][],
      value: outcome.value,
      ...(error === undefined
        ? {}
        : {
            error: {
              name: typeof error.name === 'string' ? error.name : '',
              message: typeof error.message === 'string' ? error.message : '',
            },
          }),
    });
  }

  return { id: expectedId, status: 'ok', outcomes };
}

export class WorkerUnavailable extends Error {
  constructor(cause: unknown) {
    super('Worker tidak bisa dibuat di browser ini.');
    this.name = 'WorkerUnavailable';
    this.cause = cause;
  }
}

export function createWorkerRunner(): ExerciseRunner {
  let worker: Worker | undefined;
  let objectUrl: string | undefined;
  let nextId = 1;
  let disposed = false;

  /**
   * A terminated Worker is gone for good, so the next run builds a fresh one. Deliberate rather
   * than wasteful: after a timeout the old context is in an unknown state, and reusing it would
   * leak one attempt's mess into the next.
   */
  function ensure(): Worker {
    if (worker) return worker;
    try {
      const blob = new Blob([WORKER_SOURCE], { type: 'text/javascript' });
      objectUrl = URL.createObjectURL(blob);
      worker = new Worker(objectUrl);
      return worker;
    } catch (error) {
      throw new WorkerUnavailable(error);
    }
  }

  function kill(): void {
    worker?.terminate();
    worker = undefined;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = undefined;
    }
  }

  return {
    run({ code, scenarios, timeoutMs }: RunRequest): Promise<RunResponse> {
      if (disposed) return Promise.resolve({ status: 'crash', message: 'Runner sudah ditutup.' });

      let active: Worker;
      try {
        active = ensure();
      } catch (error) {
        return Promise.reject(error);
      }

      const id = nextId++;
      const sources = scenarios.map((scenario) => buildScenarioSource(code, scenario));

      return new Promise<RunResponse>((resolve) => {
        const timer = setTimeout(() => {
          cleanup();
          kill();
          resolve({ status: 'timeout' });
        }, timeoutMs);

        function cleanup(): void {
          clearTimeout(timer);
          active.removeEventListener('message', onMessage);
          active.removeEventListener('error', onError);
        }

        function onMessage(event: MessageEvent<unknown>): void {
          // A reply from an earlier, abandoned run must not resolve this one — `parseReply`
          // returns undefined for a mismatched id, so this simply ignores it.
          const raw = event.data as { id?: unknown };
          if (raw?.id !== id) return;

          cleanup();

          const reply = parseReply(event.data, id);
          if (!reply) {
            kill();
            resolve({
              status: 'crash',
              message: 'Hasil dari mesin eksekusi tidak bisa dibaca. Coba jalankan lagi.',
            });
            return;
          }

          if (reply.status === 'crash') {
            resolve({ status: 'crash', message: describeErrorParts(reply.error) });
            return;
          }

          const consoleOutput: string[] = [];
          const results: ScenarioResult[] = reply.outcomes.map((outcome, index) => {
            const scenario = scenarios[index];
            const lines = outcome.args.map((args) => formatConsoleArgs(args));
            consoleOutput.push(...lines);

            // Judged HERE, with the same function Node uses. The Worker never decided anything.
            return judgeScenario(scenario as (typeof scenarios)[number], {
              lines,
              value: outcome.value,
              ...(outcome.error === undefined ? {} : { error: describeErrorParts(outcome.error) }),
            });
          });

          resolve({ status: 'ok', results, consoleOutput });
        }

        function onError(event: ErrorEvent): void {
          cleanup();
          kill();
          resolve({ status: 'crash', message: event.message || 'Kode gagal dijalankan.' });
        }

        active.addEventListener('message', onMessage);
        active.addEventListener('error', onError);
        active.postMessage({ id, sources });
      });
    },

    dispose(): void {
      disposed = true;
      kill();
    },
  };
}
