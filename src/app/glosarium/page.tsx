import type { Metadata } from 'next';
import { GlosariumClient } from './glosarium-client';
import { buildNavigationTree } from '@/lib/curriculum/queries';

export const metadata: Metadata = {
  title: 'Glosarium',
  description: 'Kamus istilah teknis yang muncul di kurikulum, dengan tautan ke tempat ia dibahas.',
};

/** Server wrapper — keeps the curriculum out of the client bundle (audit 2026-08-02). */
export default function GlosariumPage() {
  return <GlosariumClient categories={buildNavigationTree()} />;
}
