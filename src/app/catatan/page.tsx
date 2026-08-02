import type { Metadata } from 'next';
import { CatatanClient } from './catatan-client';
import { buildLessonIndex } from '@/lib/curriculum/queries';

export const metadata: Metadata = {
  title: 'Catatan',
  description: 'Semua catatan pribadi dari seluruh sub-bab, dengan tautan kembali ke sumbernya.',
};

/**
 * Server wrapper.
 *
 * Its only job is to build the slim lesson index here, on the server, and hand it to the client
 * component as a prop. If the client imported the curriculum directly it would pull every
 * lesson's prose and code into the browser bundle — the defect found in the 2026-08-02 audit.
 */
export default function CatatanPage() {
  return <CatatanClient lessons={buildLessonIndex()} />;
}
