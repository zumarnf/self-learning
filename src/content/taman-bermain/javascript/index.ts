import { exercises as basicDaftar } from './basic-daftar';
import { exercises as basicTeksAngka } from './basic-teks-angka';
import { exercises as intermediateAsync } from './intermediate-async';
import { exercises as intermediateBentuk } from './intermediate-bentuk';
import { exercises as intermediateProject } from './intermediate-project';
import type { Exercise } from '@/lib/taman-bermain/types';

/** JavaScript exercises, in the order a learner should meet them. */
export const javascriptExercises: Exercise[] = [
  ...basicDaftar,
  ...basicTeksAngka,
  ...intermediateBentuk,
  ...intermediateAsync,
  ...intermediateProject,
];
