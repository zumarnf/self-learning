'use client';

import { useRef, useState } from 'react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, ErrorState, Skeleton } from '@/components/ui/primitives';
import { findOrphanedKeys } from '@/lib/learning/derive';
import { parseImportFile, MAX_IMPORT_BYTES } from '@/lib/learning/schema';
import { dropOrphanedKeys, replaceAll, resetAll, useLearningStore } from '@/lib/learning/store';
import { formatDateTime } from '@/lib/utils/format';

/**
 * Settings: theme, export, import, orphaned data, and reset.
 *
 * This page is where ADR-0002's accepted limitation becomes visible to the learner. Since there
 * is no server, export is the only way progress survives a cleared browser — so it is stated
 * plainly rather than buried.
 *
 * Both destructive actions require confirmation and offer an export first (FR-3.9).
 */
export function PengaturanClient({ validLessonKeys }: { validLessonKeys: string[] }) {
  const { data, hydrated, status, recoveredFrom } = useLearningStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-8 h-72" />
      </div>
    );
  }

  const orphans = findOrphanedKeys(data, new Set(validLessonKeys));

  function exportData() {
    const payload = JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ruang-belajar-fullstack-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    // Revoking is not optional: without it the blob stays in memory for the page's lifetime.
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    setImportError(null);
    setImportOk(false);

    if (file.size > MAX_IMPORT_BYTES) {
      setImportError('Berkas terlalu besar (maksimum 5 MB).');
      return;
    }

    const text = await file.text();
    const result = parseImportFile(text);

    // On failure the existing data is not touched at all — a bad import must never cost the
    // learner what they already had (FR-3.8).
    if (!result.ok) {
      setImportError(result.reason);
      return;
    }

    replaceAll(result.data);
    setImportOk(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Data & tampilan</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Pengaturan
        </h1>
      </header>

      <div className="mt-8 space-y-4">
        <Card className="p-5">
          <h2 className="text-text font-sans text-sm font-semibold">Tema</h2>
          <p className="text-muted mt-1 text-sm">
            Pilihanmu tersimpan dan diterapkan sebelum halaman digambar, jadi tidak ada kedipan saat
            memuat.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-text font-sans text-sm font-semibold">Data belajar</h2>
          <p className="text-muted mt-1 max-w-prose text-sm">
            Progres, catatan, dan hasil kuis disimpan di browser ini saja — tidak ada server, tidak
            ada akun, tidak ada yang dikirim ke mana pun. Konsekuensinya: membersihkan data situs
            akan menghapusnya, dan progres tidak berpindah sendiri ke perangkat lain.
          </p>

          <dl className="tabular mt-4 grid gap-2 text-xs sm:grid-cols-3">
            <div className="border-border rounded-md border px-3 py-2">
              <dt className="text-faint">Sub-bab tersentuh</dt>
              <dd className="text-text mt-0.5">{Object.keys(data.lessons).length}</dd>
            </div>
            <div className="border-border rounded-md border px-3 py-2">
              <dt className="text-faint">Hari aktif tercatat</dt>
              <dd className="text-text mt-0.5">{Object.keys(data.activity).length}</dd>
            </div>
            <div className="border-border rounded-md border px-3 py-2">
              <dt className="text-faint">Terakhir diperbarui</dt>
              <dd className="text-text mt-0.5">{formatDateTime(data.updatedAt)}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={exportData}>
              Ekspor JSON
            </Button>
            <Button variant="secondary" onClick={() => fileInput.current?.click()}>
              Impor JSON
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
                event.target.value = '';
              }}
            />
          </div>

          <p className="text-2xs text-faint mt-3">
            Impor akan <strong className="text-muted">mengganti</strong> seluruh data yang ada,
            bukan menggabungkannya. Ekspor dulu kalau ragu.
          </p>

          {importError ? (
            <ErrorState
              className="mt-4"
              title="Impor dibatalkan"
              description={`${importError} Data yang sudah ada tidak diubah sama sekali.`}
            />
          ) : null}

          {importOk ? (
            <p
              role="status"
              className="border-border bg-accent-fill text-accent mt-4 rounded-md border px-3 py-2 text-sm"
            >
              Data berhasil diimpor.
            </p>
          ) : null}
        </Card>

        {status !== 'ok' || recoveredFrom ? (
          <Card className="border-border p-5">
            <h2 className="text-text font-sans text-sm font-semibold">Status penyimpanan</h2>
            <p className="text-muted mt-2 text-sm">
              {status === 'full'
                ? 'Kuota penyimpanan browser penuh. Progres terbaru tidak tersimpan sampai sebagian data dibersihkan.'
                : status === 'unavailable'
                  ? 'Browser ini memblokir penyimpanan lokal (misalnya mode privat ketat). Materi tetap bisa dibaca, tapi progres tidak akan bertahan.'
                  : 'Data yang tersimpan sebelumnya tidak bisa dibaca.'}
            </p>
            {recoveredFrom ? (
              <p className="text-faint mt-2 text-xs">
                Penyebab: {recoveredFrom} Salinan data lama disimpan di kunci{' '}
                <code className="font-mono">rbf.learning-data.corrupt-backup</code> dan tidak
                dihapus.
              </p>
            ) : null}
          </Card>
        ) : null}

        {orphans.length > 0 ? (
          <Card className="p-5">
            <h2 className="text-text font-sans text-sm font-semibold">Data lama</h2>
            <p className="text-muted mt-2 max-w-prose text-sm">
              Ada {orphans.length} entri progres yang menunjuk sub-bab yang sudah tidak ada di
              kurikulum — biasanya karena materi disusun ulang. Entri ini tidak dihitung di mana
              pun, dan sengaja tidak dihapus otomatis.
            </p>
            <Button variant="secondary" className="mt-4" onClick={() => dropOrphanedKeys(orphans)}>
              Hapus {orphans.length} entri lama
            </Button>
          </Card>
        ) : null}

        <Card className="p-5">
          <h2 className="text-danger font-sans text-sm font-semibold">Reset progres</h2>
          <p className="text-muted mt-2 max-w-prose text-sm">
            Menghapus seluruh progres, catatan, hasil kuis, dan riwayat aktivitas. Tidak bisa
            dibatalkan. Preferensi tema tidak ikut terhapus.
          </p>

          {confirmReset ? (
            <div className="border-border bg-danger-fill mt-4 rounded-md border p-4">
              <p className="text-text text-sm">
                Yakin? Ekspor dulu kalau kamu masih mungkin membutuhkannya.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={exportData}>
                  Ekspor dulu
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                  }}
                >
                  Ya, hapus semuanya
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" className="mt-4" onClick={() => setConfirmReset(true)}>
              Reset progres
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
