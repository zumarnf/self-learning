'use client';

import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/components/taman-bermain/confirm-dialog';
import { Button } from '@/components/ui/button';
import { CheckIcon, CloseIcon } from '@/components/ui/icons';
import { parseInline } from '@/lib/content/parse-inline';

/**
 * The answer key, written to be learned from rather than copied.
 *
 * Five parts, in the order a beginner needs them: the code, how it works step by step, the one
 * idea worth keeping, other ways that are ALSO correct, and the mistakes people actually make.
 * The last two are the answer to the question every learner has after reading a model answer —
 * "was my different version wrong?" — and their data was already proved by CI; it was simply
 * never shown.
 *
 * Other answers and mistakes sit inside `<details>`. A wall of five code blocks overwhelms a
 * beginner; a list of sentences they can open one at a time does not.
 *
 * Every `*Html` prop is Shiki output produced on the SERVER over code strings that live in this
 * repository. Nothing a reader types can reach it — the same guarantee `CodeBlock` documents, and
 * the reason `dangerouslySetInnerHTML` is acceptable here (docs/adr/0004, security.md).
 *
 * The editor is never overwritten. Copying the answer in is the reader's decision.
 */

export type Kesalahan = { reason: string; html: string };

export function SolutionReveal({
  solutionHtml,
  steps,
  explanation,
  alternativesHtml,
  mistakes,
  alreadyRevealed,
  onReveal,
}: {
  solutionHtml: string;
  steps: string[];
  explanation: string;
  alternativesHtml: string[];
  mistakes: Kesalahan[];
  alreadyRevealed: boolean;
  onReveal: () => void;
}) {
  const [terlihat, setTerlihat] = useState(alreadyRevealed);
  const [bertanya, setBertanya] = useState(false);

  if (!terlihat) {
    return (
      <section className="border-border rounded-lg border border-dashed px-5 py-4">
        <h2 className="text-text font-sans text-sm font-semibold">Kunci jawaban</h2>
        <p className="text-muted mt-1 text-sm">
          Berisi kode jawaban, cara kerjanya langkah demi langkah, cara lain yang juga benar, dan
          kesalahan yang sering terjadi.
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setBertanya(true)}>
          Lihat kunci jawaban
        </Button>

        {bertanya ? (
          <ConfirmDialog
            title="Tampilkan kunci jawaban?"
            body="Kamu masih bisa mengerjakan sendiri setelahnya, dan editormu tidak akan ditimpa. Soal ini akan ditandai pernah dibuka kuncinya."
            confirmLabel="Tampilkan"
            onCancel={() => setBertanya(false)}
            onConfirm={() => {
              setBertanya(false);
              setTerlihat(true);
              onReveal();
            }}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section aria-labelledby="judul-kunci" className="border-border rounded-lg border px-5 py-5">
      <h2 id="judul-kunci" className="text-text font-sans text-base font-semibold">
        Kunci jawaban
      </h2>
      <p className="text-faint mt-1 text-xs">
        Editormu sengaja tidak ditimpa, jadi ketikanmu tetap utuh.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <SubJudul>Kode jawaban</SubJudul>
          <BlokKode html={solutionHtml} />
        </div>

        <div>
          <SubJudul>Cara kerjanya, langkah demi langkah</SubJudul>
          <ol className="space-y-2.5">
            {steps.map((langkah, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="tabular bg-raised text-muted border-border mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-medium"
                >
                  {index + 1}
                </span>
                <span className="text-muted text-sm leading-relaxed">{parseInline(langkah)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="border-accent bg-accent-fill mt-6 rounded-md border-l-2 px-4 py-3">
        <p className="text-2xs text-accent mb-1 font-semibold tracking-[0.08em] uppercase">
          Inti yang perlu diingat
        </p>
        <p className="text-text font-serif text-[0.98rem] leading-relaxed">
          {parseInline(explanation)}
        </p>
      </div>

      {alternativesHtml.length > 0 ? (
        <div className="mt-6">
          <SubJudul ikon={<CheckIcon size={13} className="text-accent" />}>
            Cara lain yang juga benar
          </SubJudul>
          <p className="text-muted mb-3 text-sm">
            Jawabanmu tidak harus sama persis dengan kunci di atas. Yang dinilai perilaku dan
            aturannya, bukan bentuk tulisannya. Semua cara di bawah ini lolos pemeriksaan.
          </p>
          <div className="space-y-2">
            {alternativesHtml.map((html, index) => (
              <details key={index} className="border-border group rounded-md border">
                <summary className="text-text hover:bg-raised cursor-pointer rounded-md px-3 py-2 text-sm">
                  Cara lain {index + 1}
                </summary>
                <div className="px-3 pb-3">
                  <BlokKode html={html} />
                </div>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      {mistakes.length > 0 ? (
        <div className="mt-6">
          <SubJudul ikon={<CloseIcon size={13} className="text-danger" />}>
            Kesalahan yang sering terjadi
          </SubJudul>
          <p className="text-muted mb-3 text-sm">
            Jawaban seperti ini <strong className="text-text">ditolak</strong> pemeriksa. Baca
            alasannya dulu, baru buka kodenya kalau perlu.
          </p>
          <ul className="space-y-2">
            {mistakes.map((salah, index) => (
              <li key={index} className="border-border rounded-md border">
                <p className="text-text px-3 pt-2.5 text-sm leading-relaxed">
                  <span className="sr-only">Kesalahan {index + 1}. </span>
                  {parseInline(salah.reason)}
                </p>
                <details className="px-3 pt-1 pb-2.5">
                  <summary className="text-muted hover:text-text cursor-pointer text-xs">
                    Lihat kodenya
                  </summary>
                  <div className="mt-2">
                    <BlokKode html={salah.html} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function SubJudul({ children, ikon }: { children: string; ikon?: ReactNode }) {
  return (
    <h3 className="text-2xs text-faint mb-2.5 flex items-center gap-1.5 font-medium tracking-[0.08em] uppercase">
      {ikon}
      {children}
    </h3>
  );
}

function BlokKode({ html }: { html: string }) {
  return (
    <div className="border-code-border bg-code-bg overflow-x-auto rounded-md border">
      {/* Shiki output over repository content — never reader input. See the note above. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
