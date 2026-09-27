'use client';

import type { ReactNode } from 'react';
import { BookIcon } from '@/components/ui/icons';
import { parseInline } from '@/lib/content/parse-inline';
import { display } from '@/lib/taman-bermain/compare';
import type { Exercise, Scenario } from '@/lib/taman-bermain/types';

/**
 * Everything the learner reads before writing a line, in a fixed order.
 *
 * The order is the point. A beginner who knows "what to write" is always the second section never
 * has to read the whole page to find it. Concrete first (a situation they can picture), then the
 * task, then the code they must use, then a worked example, then the rules the checker enforces,
 * then the traps, then the vocabulary.
 *
 * All prose goes through `parseInline`, so `code` renders as code and **emphasis** as emphasis
 * instead of as stray backticks and asterisks — which is how every brief used to appear.
 */
export function BriefView({
  exercise,
  givenHtml,
}: {
  exercise: Exercise;
  /** Server-highlighted HTML of `brief.given`. Shiki output over repository content only. */
  givenHtml: string | null;
}) {
  const { brief, rules } = exercise;

  return (
    <div className="space-y-7">
      <Bagian judul="Situasinya">
        <p className="text-muted font-serif text-[1.02rem] leading-relaxed">
          {parseInline(brief.situation)}
        </p>
      </Bagian>

      <Bagian judul="Yang harus kamu buat">
        <ol className="space-y-2">
          {brief.tasks.map((tugas, index) => (
            <li key={index} className="flex gap-3">
              <span
                aria-hidden="true"
                className="tabular bg-raised text-muted border-border mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-medium"
              >
                {index + 1}
              </span>
              <span className="text-text text-sm leading-relaxed">{parseInline(tugas)}</span>
            </li>
          ))}
        </ol>
      </Bagian>

      {brief.given && givenHtml !== null ? (
        <Bagian judul="Kode yang sudah ada">
          <p className="text-muted mb-2 text-xs">
            Kode ini sudah jadi. Kamu <strong className="text-text">memakainya</strong>, bukan
            menulis ulang.
          </p>
          <div className="border-code-border bg-code-bg overflow-hidden rounded-md border">
            <p className="border-code-border text-2xs text-faint border-b px-3 py-1.5 font-mono">
              {brief.given.file}
            </p>
            {/* Shiki output over a code string from this repository, highlighted on the server.
                No reader input reaches it (docs/adr/0004, security.md). */}
            <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: givenHtml }} />
          </div>
        </Bagian>
      ) : null}

      <ContohSkenario exercise={exercise} />

      <Bagian judul="Aturan" catatan="diperiksa otomatis">
        <ul className="space-y-1.5">
          {rules.map((aturan, index) => (
            <li key={index} className="text-muted flex gap-2 text-sm leading-relaxed">
              <span aria-hidden="true" className="text-faint">
                ·
              </span>
              <span>{parseInline(aturan)}</span>
            </li>
          ))}
        </ul>
      </Bagian>

      <Bagian judul="Yang sering terlewat">
        <ul className="space-y-2">
          {brief.pitfalls.map((hal, index) => (
            <li
              key={index}
              className="border-warning-fill text-muted border-l-2 pl-3 text-sm leading-relaxed"
            >
              {parseInline(hal)}
            </li>
          ))}
        </ul>
      </Bagian>

      <IstilahSoal terms={brief.terms} />
    </div>
  );
}

function Bagian({
  judul,
  catatan,
  children,
}: {
  judul: string;
  catatan?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xs text-faint mb-2.5 font-medium tracking-[0.08em] uppercase">
        {judul}
        {catatan ? (
          <span className="text-faint ml-1.5 tracking-normal normal-case">({catatan})</span>
        ) : null}
      </h2>
      {children}
    </section>
  );
}

/**
 * Same look as the lesson `terms` block (ADR-0006), so a learner arriving from a lesson sees a
 * familiar thing. Named by its visible heading rather than an `aria-label`, so a screen reader
 * does not announce the same words twice.
 */
function IstilahSoal({ terms }: { terms: Exercise['brief']['terms'] }) {
  return (
    <aside
      aria-labelledby="istilah-soal"
      className="border-border bg-sunken rounded-md border border-dashed px-4 py-3.5"
    >
      <p
        id="istilah-soal"
        className="text-2xs text-muted flex items-center gap-2 font-semibold tracking-[0.08em] uppercase"
      >
        <BookIcon size={15} />
        <span>Istilah di soal ini</span>
      </p>
      <dl className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,8rem)_1fr]">
        {terms.map((item) => (
          <div key={item.term} className="contents">
            {/* `translate="no"` keeps auto-translation from turning `key` into a word. */}
            <dt translate="no" className="text-text font-mono text-[0.82rem] leading-6 break-words">
              {item.term}
            </dt>
            <dd className="text-muted font-serif text-[0.95rem] leading-relaxed">
              {parseInline(item.meaning)}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

/**
 * Worked examples: only the scenarios the exercise chose to show (PRD §2.3).
 *
 * The `prelude` is shown too. It used to be hidden, which meant an example like `saringAktif(data)`
 * referred to a `data` the reader could never see.
 */
function ContohSkenario({ exercise }: { exercise: Exercise }) {
  if (exercise.check.engine !== 'js') return null;

  const tampak = exercise.check.scenarios.filter((scenario) => scenario.visible);
  if (tampak.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xs text-faint mb-2.5 font-medium tracking-[0.08em] uppercase">Contoh</h2>
      <ul className="space-y-3">
        {tampak.map((scenario) => (
          <li key={scenario.id} className="border-code-border bg-code-bg rounded-md border p-3">
            <p className="text-2xs text-faint mb-2">{parseInline(scenario.name)}</p>
            <IsiContoh scenario={scenario} />
          </li>
        ))}
      </ul>
      <p className="text-2xs text-faint mt-2">
        Ada skenario lain yang tidak ditampilkan. Jawabanmu juga diuji dengan skenario itu.
      </p>
    </section>
  );
}

function IsiContoh({ scenario }: { scenario: Scenario }) {
  const dasar = 'font-mono text-xs leading-[1.65] whitespace-pre-wrap break-words';
  const kode = `text-text ${dasar}`;
  const hasil = `text-accent ${dasar}`;
  const label = 'text-2xs text-faint mb-1';

  return (
    <div className="space-y-2.5">
      {scenario.prelude ? (
        <div>
          <p className={label}>Data yang tersedia</p>
          <pre className={kode}>{scenario.prelude}</pre>
        </div>
      ) : null}

      {scenario.expect.type === 'output' ? (
        <div>
          <p className={label}>Keluaran yang diharapkan</p>
          <pre className={kode}>{scenario.expect.lines.join('\n')}</pre>
        </div>
      ) : (
        <>
          <div>
            <p className={label}>Kalau dipanggil</p>
            <pre className={kode}>{scenario.expect.expression}</pre>
          </div>
          <div>
            <p className={label}>Hasilnya harus</p>
            <pre className={hasil}>{display(scenario.expect.equals, { sortKeys: false })}</pre>
          </div>
        </>
      )}
    </div>
  );
}
