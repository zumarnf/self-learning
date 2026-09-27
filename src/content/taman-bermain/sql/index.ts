import { exercises as basic } from './basic';
import { exercises as diAplikasi } from './di-aplikasi';
import { exercises as intermediate } from './intermediate';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * SQL exercises in PostgreSQL dialect. `basic` and `intermediate` are pure SQL, graded
 * structurally with keywords case-insensitive. `diAplikasi` is SQL as it is sent from Node through `pg`,
 * and is executed against a fake client.
 */
export const sqlExercises: Exercise[] = [...basic, ...intermediate, ...diAplikasi];
