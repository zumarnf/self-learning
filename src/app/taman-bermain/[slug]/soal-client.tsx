'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BriefView } from '@/components/taman-bermain/brief-view';
import { CodeEditor } from '@/components/taman-bermain/code-editor';
import { ConfirmDialog } from '@/components/taman-bermain/confirm-dialog';
import { HintList } from '@/components/taman-bermain/hint-list';
import { OutputPanel, type OutputState } from '@/components/taman-bermain/output-panel';
import { ResultPanel } from '@/components/taman-bermain/result-panel';
import { SolutionReveal, type Kesalahan } from '@/components/taman-bermain/solution-reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import {
  recordExerciseAttempt,
  revealExerciseSolution,
  setExerciseDraft,
  useLearningStore,
} from '@/lib/learning/store';
import { parseInline, stripInline } from '@/lib/content/parse-inline';
import { grade } from '@/lib/taman-bermain/grade';
import { createWorkerRunner, WorkerUnavailable } from '@/lib/taman-bermain/runner-worker';
import type { ExerciseRunner } from '@/lib/taman-bermain/runner';
import type { CheckResult, Exercise } from '@/lib/taman-bermain/types';

type Tetangga = { slug: string; title: string } | null;

/**
 * The exercise page.
 *
 * Running and checking are separate on purpose. Pressing "Jalankan" changes no status at all, so
 * experimenting costs nothing — a reader who is afraid of a button will stop pressing it, and then
 * the feature is just a worse text editor.
 */
export function SoalClient({
  exercise,
  highlighted,
  chapter,
  previous,
  next,
}: {
  exercise: Exercise;
  /** Server-highlighted HTML for every piece of code on the page. Shiki over repo content only. */
  highlighted: {
    solution: string;
    alternatives: string[];
    mistakes: Kesalahan[];
    given: string | null;
  };
  chapter: { title: string; href: string } | null;
  previous: Tetangga;
  next: Tetangga;
}) {
  const { data, hydrated } = useLearningStore();
  const [code, setCode] = useState(exercise.starter);
  const [output, setOutput] = useState<OutputState>({ kind: 'idle' });
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [running, setRunning] = useState(false);
  const [runnerRusak, setRunnerRusak] = useState(false);
  const [tanyaReset, setTanyaReset] = useState(false);

  const runnerRef = useRef<ExerciseRunner | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const state = data.exercises[exercise.slug];

  // Restore the saved draft exactly once, after hydration.
  //
  // Adjusted DURING RENDER rather than in an effect — the same pattern `SidebarNav` uses, and for
  // the same two reasons: it avoids the extra frame where the starter code is still on screen, and
  // it avoids the cascading render the React Compiler lint rule flags. The guard matters as much
  // as the placement: without it, the debounced save of this very draft would come back around and
  // overwrite what is being typed.
  if (hydrated && !draftRestored) {
    setDraftRestored(true);
    const saved = state?.code;
    if (saved !== undefined && saved.length > 0) setCode(saved);
  }

  useEffect(() => {
    return () => {
      runnerRef.current?.dispose();
      runnerRef.current = null;
    };
  }, []);

  function ubahKode(next: string): void {
    setCode(next);
    setExerciseDraft(exercise.slug, next);
  }

  /** Lazily built, so a page that is only being read never loads the engine (NFR-TB-P1). */
  function ambilRunner(): ExerciseRunner | null {
    if (runnerRef.current) return runnerRef.current;
    try {
      runnerRef.current = createWorkerRunner();
      return runnerRef.current;
    } catch (error) {
      if (error instanceof WorkerUnavailable) {
        setRunnerRusak(true);
        return null;
      }
      throw error;
    }
  }

  async function jalankan(): Promise<void> {
    if (exercise.check.engine !== 'js') return;

    setOutput(runnerRef.current ? { kind: 'berjalan' } : { kind: 'memuat-mesin' });
    setRunning(true);

    const runner = ambilRunner();
    if (!runner) {
      setOutput({ kind: 'crash', message: 'Mesin eksekusi tidak tersedia di browser ini.' });
      setRunning(false);
      return;
    }

    setOutput({ kind: 'berjalan' });

    const outcome = await runner.run({
      code,
      scenarios: exercise.check.scenarios,
      timeoutMs: 2000,
    });

    if (outcome.status === 'timeout') {
      setOutput({
        kind: 'timeout',
        message:
          'Kodemu berjalan lebih dari 2 detik lalu dihentikan. Periksa kondisi berhenti pada loop-mu.',
      });
    } else if (outcome.status === 'crash') {
      setOutput({ kind: 'crash', message: outcome.message });
    } else {
      setOutput({ kind: 'ok', lines: outcome.consoleOutput });
    }

    setRunning(false);
  }

  async function periksa(): Promise<void> {
    setChecking(true);

    // The structural engine never executes, so it needs no runner at all. Building one anyway
    // would download the worker for a Laravel exercise that will never use it.
    const runner =
      exercise.check.engine === 'js'
        ? ambilRunner()
        : ({
            run: async () => ({ status: 'ok' as const, results: [], consoleOutput: [] }),
            dispose: () => {},
          } satisfies ExerciseRunner);

    if (!runner) {
      setChecking(false);
      return;
    }

    const hasil = await grade(exercise.check, code, runner);
    setResult(hasil);
    if (hasil.consoleOutput.length > 0) setOutput({ kind: 'ok', lines: hasil.consoleOutput });
    recordExerciseAttempt(exercise.slug, hasil.passed);
    setChecking(false);
  }

  const sudahBenar = state?.status === 'benar';

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-faint text-xs">
        <Link href="/taman-bermain" className="hover:text-muted">
          Taman Bermain
        </Link>
        {chapter ? (
          <>
            <span aria-hidden="true"> › </span>
            <Link href={chapter.href} className="hover:text-muted">
              {chapter.title}
            </Link>
          </>
        ) : null}
      </nav>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-text font-sans text-xl font-semibold tracking-tight md:text-2xl">
            {parseInline(exercise.title)}
          </h1>
          {sudahBenar ? <Badge tone="accent">Sudah benar</Badge> : null}
        </div>
        <p className="text-faint mt-1 text-xs">
          {exercise.level === 'basic' ? 'Basic' : 'Intermediate'} ·{' '}
          {exercise.check.engine === 'js'
            ? 'dijalankan di browsermu'
            : 'diperiksa dari bentuk kodenya, tanpa dijalankan'}
        </p>
        <p className="text-muted mt-2 max-w-prose text-sm">
          <span className="text-faint">Dipakai untuk:</span> {parseInline(exercise.realWorldUse)}
        </p>
      </header>

      {runnerRusak ? (
        <p
          role="alert"
          className="border-border bg-warning-fill text-text mt-4 rounded-md border px-4 py-2 text-xs"
        >
          Pemeriksaan otomatis tidak bisa dijalankan di browser ini. Kamu tetap bisa menulis kode
          dan membuka kunci jawaban.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-7">
          <BriefView exercise={exercise} givenHtml={highlighted.given} />
          <HintList hints={exercise.hints} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xs text-faint font-medium tracking-[0.08em] uppercase">
                Kodemu
              </h2>
              {/*
                Reset throws away what the learner typed, which `frontend.md` calls the most
                painful and most avoidable UX failure there is. So it asks first — but only when
                there is something to lose. Confirming a no-op would just train the reader to
                click through dialogs without reading them.
              */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (code === exercise.starter) return;
                  setTanyaReset(true);
                }}
                disabled={code === exercise.starter}
              >
                Reset
              </Button>
            </div>
            <CodeEditor
              value={code}
              onChange={ubahKode}
              label={`Kode jawaban untuk soal ${stripInline(exercise.title)}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {exercise.check.engine === 'js' ? (
              <Button
                variant="secondary"
                onClick={() => void jalankan()}
                disabled={running || checking}
                aria-busy={running}
              >
                {running ? 'Menjalankan…' : 'Jalankan'}
              </Button>
            ) : null}
            <Button
              variant="primary"
              onClick={() => void periksa()}
              disabled={running || checking}
              aria-busy={checking}
            >
              {checking ? 'Memeriksa…' : 'Periksa jawaban'}
            </Button>
          </div>

          {exercise.check.engine === 'js' ? <OutputPanel state={output} /> : null}
          <ResultPanel result={result} checking={checking} />
        </div>
      </div>

      {tanyaReset ? (
        <ConfirmDialog
          title="Kembalikan ke kode awal?"
          body="Kode yang sudah kamu tulis akan hilang dan diganti kerangka awal soal ini. Tidak bisa dibatalkan."
          confirmLabel="Kembalikan"
          onCancel={() => setTanyaReset(false)}
          onConfirm={() => {
            setTanyaReset(false);
            ubahKode(exercise.starter);
          }}
        />
      ) : null}

      {/* Full width, below the grid: the answer key now carries several code blocks, and a
          40% column would force every one of them to scroll sideways. */}
      <div className="mt-8">
        <SolutionReveal
          solutionHtml={highlighted.solution}
          steps={exercise.solution.steps}
          explanation={exercise.solution.explanation}
          alternativesHtml={highlighted.alternatives}
          mistakes={highlighted.mistakes}
          alreadyRevealed={state?.revealed === true}
          onReveal={() => revealExerciseSolution(exercise.slug)}
        />
      </div>

      <nav
        aria-label="Soal lain"
        className="border-border mt-10 flex items-center justify-between gap-4 border-t pt-5"
      >
        {previous ? (
          <Link
            href={`/taman-bermain/${previous.slug}`}
            className="text-muted hover:text-text flex items-center gap-1.5 text-sm"
          >
            <ChevronLeftIcon size={14} />
            <span className="truncate">{parseInline(previous.title)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/taman-bermain/${next.slug}`}
            className="text-muted hover:text-text flex items-center gap-1.5 text-right text-sm"
          >
            <span className="truncate">{parseInline(next.title)}</span>
            <ChevronRightIcon size={14} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
