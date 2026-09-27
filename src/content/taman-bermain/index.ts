import { backendExercises } from './backend';
import { javascriptExercises } from './javascript';
import { reactExercises } from './react';
import { sqlExercises } from './sql';
import { uiExercises } from './ui';
import { laravelExercises } from './laravel';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * The exercise bank.
 *
 * SERVER ONLY — this module carries every answer key and every check spec. It is reached through
 * `@/lib/taman-bermain/queries`, and `client-bundle-boundary.test.ts` makes sure no Client
 * Component ever imports either of them at runtime.
 */
export function getExerciseBank(): Exercise[] {
  return [
    ...javascriptExercises,
    ...reactExercises,
    ...uiExercises,
    ...backendExercises,
    ...sqlExercises,
    ...laravelExercises,
  ];
}
