import { dedent } from '@/lib/content/builders';
import type {
  CheckSpec,
  Constraint,
  Exercise,
  Scenario,
  SourceLanguage,
  StructuralAssertion,
} from './types';

/**
 * Authoring helpers for the exercise bank.
 *
 * Exercises are verbose by design — every one carries its official answer, the other answers that
 * must also pass, and the answers that must fail. That verbosity is what makes the grader provable
 * (PRD §7 R-1), but written out longhand forty times it would be unreadable. These helpers pay
 * part of it back.
 *
 * Thin on purpose, like `content/builders.ts`: no defaulting, no cleverness. A helper that quietly
 * rewrote a pattern would make a failing exercise impossible to reason about.
 */

export { dedent };

/* ---------------------------------------------------------------- constraints */

export function wajib(id: string, label: string, pattern: string, flags?: string): Constraint {
  return {
    id,
    label,
    rule:
      flags === undefined ? { type: 'wajib-ada', pattern } : { type: 'wajib-ada', pattern, flags },
  };
}

export function larang(id: string, label: string, pattern: string, flags?: string): Constraint {
  return {
    id,
    label,
    rule:
      flags === undefined ? { type: 'dilarang', pattern } : { type: 'dilarang', pattern, flags },
  };
}

export function maksBaris(id: string, label: string, value: number): Constraint {
  return { id, label, rule: { type: 'maks-baris', value } };
}

/* ------------------------------------------------------------------ scenarios */

type ScenarioOptions = { visible?: boolean; prelude?: string };

/** A scenario that checks what the code printed. */
export function cetak(
  id: string,
  name: string,
  lines: string[],
  options: ScenarioOptions = {},
): Scenario {
  return {
    id,
    name,
    visible: options.visible ?? false,
    ...(options.prelude === undefined ? {} : { prelude: dedent(options.prelude) }),
    expect: { type: 'output', lines },
  };
}

/** A scenario that checks a value after the code has run — the shape that takes many inputs. */
export function nilai(
  id: string,
  name: string,
  expression: string,
  equals: unknown,
  options: ScenarioOptions = {},
): Scenario {
  return {
    id,
    name,
    visible: options.visible ?? false,
    ...(options.prelude === undefined ? {} : { prelude: dedent(options.prelude) }),
    // Dedented because visible scenarios are SHOWN to the learner in the Contoh section. A
    // multi-line async example written inside an indented template literal would otherwise appear
    // twelve spaces deep. Single-line expressions have no leading whitespace and pass unchanged.
    expect: { type: 'nilai', expression: dedent(expression), equals },
  };
}

/* ------------------------------------------------------- structural assertions */

export function wajibStruktur(
  id: string,
  label: string,
  hint: string,
  pattern: string,
): StructuralAssertion {
  return { id, label, hint, rule: { type: 'wajib-ada', pattern } };
}

export function larangStruktur(
  id: string,
  label: string,
  hint: string,
  pattern: string,
): StructuralAssertion {
  return { id, label, hint, rule: { type: 'dilarang', pattern } };
}

export function urutStruktur(
  id: string,
  label: string,
  hint: string,
  patterns: string[],
): StructuralAssertion {
  return { id, label, hint, rule: { type: 'berurutan', patterns } };
}

/* ----------------------------------------------------------------- check specs */

export function mesinJs(constraints: Constraint[], scenarios: Scenario[]): CheckSpec {
  return { engine: 'js', constraints, scenarios };
}

export function mesinStruktur(
  bahasa: SourceLanguage,
  assertions: StructuralAssertion[],
): CheckSpec {
  return { engine: 'struktur', bahasa, assertions };
}

/* -------------------------------------------------------------------- exercise */

/**
 * Every code string an exercise carries goes through `dedent`.
 *
 * Exercise files indent their template literals to match the surrounding code; without this the
 * learner would open the editor to code indented four levels deep for no reason, and every
 * `maks-baris` rule would be measuring the file's formatting rather than the answer.
 */
export function soal(draft: Exercise): Exercise {
  return {
    ...draft,
    starter: dedent(draft.starter),
    brief:
      draft.brief.given === undefined
        ? draft.brief
        : { ...draft.brief, given: { ...draft.brief.given, code: dedent(draft.brief.given.code) } },
    solution: { ...draft.solution, code: dedent(draft.solution.code) },
    alternativeSolutions: draft.alternativeSolutions.map(dedent),
    rejectedSolutions: draft.rejectedSolutions.map((entry) => ({
      ...entry,
      code: dedent(entry.code),
    })),
  };
}
