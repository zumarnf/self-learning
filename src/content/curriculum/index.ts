import type { Curriculum } from '@/lib/curriculum/types';
import { backendBasic } from './backend-basic';
import { backendIntermediate } from './backend-intermediate';
import { deployment } from './deployment';
import { frontendBasic } from './frontend-basic';
import { frontendIntermediate } from './frontend-intermediate';
import { keamananFullstack } from './keamanan-fullstack';
import { promptEngineering } from './prompt-engineering';
import { systemDesign } from './system-design';

/**
 * The curriculum: 8 categories, 42 chapters, 410 lessons.
 *
 * The array order IS the learning order — "previous/next" and the roadmap both read it directly,
 * so reordering here reorders the whole path. Structural rules (unique slugs, gapless lesson
 * numbering, prerequisites that point at real chapters, valid quiz answer indices) are enforced
 * by the integrity test rather than by discipline.
 */
export const curriculum: Curriculum = [
  frontendBasic,
  frontendIntermediate,
  backendBasic,
  backendIntermediate,
  keamananFullstack,
  deployment,
  systemDesign,
  promptEngineering,
];
