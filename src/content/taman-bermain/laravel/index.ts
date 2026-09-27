import { exercises as basicEndpoint } from './basic-endpoint';
import { exercises as basicSkema } from './basic-skema';
import { exercises as intermediate } from './intermediate';
import type { Exercise } from '@/lib/taman-bermain/types';

/** Laravel/PHP exercises, graded by the structural engine. */
export const laravelExercises: Exercise[] = [...basicSkema, ...basicEndpoint, ...intermediate];
