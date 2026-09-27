'use client';

import { CheckIcon, CloseIcon } from '@/components/ui/icons';
import { parseInline } from '@/lib/content/parse-inline';
import type { CheckResult } from '@/lib/taman-bermain/types';

/**
 * The screen that decides whether this feature is useful or merely annoying.
 *
 * It never says only "salah". Every row names itself, and a failed row shows what was expected
 * next to what came back. Passing rows stay visible too: seeing three of five pass is
 * information, while seeing only the failures reads as punishment.
 *
 * Status is carried by icon AND text AND colour, never colour alone (NFR-TB-A3), and the whole
 * region is a polite live region so a screen-reader user hears the verdict without being yanked
 * out of the editor (NFR-TB-A2).
 */

export function ResultPanel({
  result,
  checking,
}: {
  result: CheckResult | null;
  checking: boolean;
}) {
  return (
    <section className="border-border bg-surface overflow-hidden rounded-lg border">
      <header className="border-border flex items-center justify-between gap-2 border-b px-4 py-2">
        <h2 className="text-2xs text-faint font-medium tracking-[0.08em] uppercase">
          Hasil pemeriksaan
        </h2>
        {result ? <Ringkasan result={result} /> : null}
      </header>

      <div aria-live="polite" aria-atomic="true" className="min-h-[7.5rem] px-4 py-3">
        {checking ? (
          <p className="text-muted text-sm">Memeriksa jawabanmu…</p>
        ) : result === null ? (
          <p className="text-muted text-sm">
            Tekan <span className="text-text font-medium">Periksa jawaban</span> kalau kamu sudah
            siap.
          </p>
        ) : (
          <Rincian result={result} />
        )}
      </div>
    </section>
  );
}

function Ringkasan({ result }: { result: CheckResult }) {
  const lolos =
    result.constraints.filter((row) => row.passed).length +
    result.scenarios.filter((row) => row.passed).length;
  const total = result.constraints.length + result.scenarios.length;

  return (
    <p className={`text-xs font-medium ${result.passed ? 'text-accent' : 'text-danger'}`}>
      {result.passed ? 'Benar' : `Belum tepat, ${lolos} dari ${total} lolos`}
    </p>
  );
}

function Rincian({ result }: { result: CheckResult }) {
  const judulAturan =
    result.engine === 'struktur' ? 'Yang diperiksa dari kodemu' : 'Aturan penulisan';

  return (
    <div className="space-y-4">
      {result.passed ? (
        <p className="text-accent text-sm font-medium">Benar. Semua aturan dan skenario lolos.</p>
      ) : null}

      {result.constraints.length > 0 ? (
        <div>
          <h3 className="text-2xs text-faint mb-2 font-medium tracking-[0.08em] uppercase">
            {judulAturan}
          </h3>
          <ul className="space-y-1.5">
            {result.constraints.map((row) => (
              <li key={row.id}>
                <Baris passed={row.passed} label={row.label} detail={row.detail} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-2xs text-faint mb-2 font-medium tracking-[0.08em] uppercase">
          Skenario
        </h3>
        {result.scenarios.length === 0 ? (
          <p className="text-muted text-sm">{alasanTanpaSkenario(result)}</p>
        ) : (
          <ul className="space-y-2">
            {result.scenarios.map((row) => (
              <li key={row.id}>
                <Baris passed={row.passed} label={row.name} />
                {!row.passed ? (
                  <dl className="border-border mt-1.5 ml-6 grid gap-1 border-l pl-3 text-xs">
                    <div className="flex gap-2">
                      <dt className="text-faint w-20 shrink-0">diharapkan</dt>
                      <dd className="tabular text-muted font-mono break-all">
                        {row.expectedDisplay}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-faint w-20 shrink-0">didapat</dt>
                      <dd className="tabular text-danger font-mono break-all">
                        {row.actualDisplay}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Empty scenarios are never left unexplained.
 *
 * Three of these four are not failures of the run at all — they are the grader saying what it did
 * and did not do, which is the difference between an honest blank box and a confusing one.
 */
function alasanTanpaSkenario(result: CheckResult): string {
  switch (result.skipReason) {
    case 'batasan-gagal':
      return 'Belum dijalankan. Perbaiki dulu aturan penulisan di atas.';
    case 'tanpa-eksekusi':
      return 'Soal ini diperiksa dari bentuk kodenya, bukan dengan menjalankannya.';
    case 'timeout':
    case 'crash':
      return result.message ?? 'Kode tidak bisa dijalankan.';
    default:
      return 'Tidak ada skenario untuk soal ini.';
  }
}

function Baris({
  passed,
  label,
  detail,
}: {
  passed: boolean;
  label: string;
  detail?: string | undefined;
}) {
  return (
    <div className="flex gap-2">
      <span
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${passed ? 'text-accent' : 'text-danger'}`}
      >
        {passed ? <CheckIcon size={13} /> : <CloseIcon size={13} />}
      </span>
      <div className="min-w-0">
        <p className={`text-sm ${passed ? 'text-muted' : 'text-text font-medium'}`}>
          <span className="sr-only">{passed ? 'Lolos. ' : 'Gagal. '}</span>
          {parseInline(label)}
        </p>
        {detail !== undefined && !passed ? (
          <p className="text-muted mt-0.5 text-xs leading-relaxed">{parseInline(detail)}</p>
        ) : null}
      </div>
    </div>
  );
}
