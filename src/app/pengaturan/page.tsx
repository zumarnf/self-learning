import type { Metadata } from 'next';
import { PengaturanClient } from './pengaturan-client';
import { flattenLessons } from '@/lib/curriculum/queries';

export const metadata: Metadata = {
  title: 'Pengaturan',
  description: 'Tema, ekspor dan impor data belajar, serta reset progres.',
};

/**
 * Server wrapper. Only the list of valid lesson keys crosses to the client — enough to detect
 * orphaned progress, without shipping the curriculum itself (audit 2026-08-02).
 */
export default function PengaturanPage() {
  return <PengaturanClient validLessonKeys={flattenLessons().map((l) => l.key)} />;
}
