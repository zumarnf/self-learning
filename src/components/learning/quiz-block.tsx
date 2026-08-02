'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, CloseIcon } from '@/components/ui/icons';
import { scoreQuiz, type QuizResult } from '@/lib/learning/derive';
import { recordQuizAttempt, useLearningStore } from '@/lib/learning/store';
import type { QuizQuestion } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

/**
 * Multiple-choice quiz.
 *
 * Three things here are requirements, not styling choices:
 *
 * 1. Submitting with unanswered questions is refused *and* says which ones are missing — a
 *    disabled button with no explanation is a dead end (SRS FR-4.3).
 * 2. Every question gets an explanation afterwards, right and wrong alike. A score on its own
 *    teaches nothing (FR-4.2).
 * 3. Correct/incorrect is carried by an icon and a word, not by green and red. Colour is never
 *    the only signal (NFR-A4).
 *
 * The correct index lives in the module's props, which are part of the server-rendered payload,
 * so this quiz is not a security boundary — it is a learning aid for one person studying alone.
 * Options are not shuffled, deliberately: a stable order makes it possible to talk about
 * "option C" in a note.
 */
export function QuizBlock({
  id,
  questions,
  storageKey,
  title = 'Kuis',
}: {
  id: string;
  questions: QuizQuestion[];
  /** `category/chapter` — when given, the best score is remembered. */
  storageKey?: string;
  title?: string;
}) {
  const domId = useId();
  const { data, hydrated } = useLearningStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  const best = storageKey ? data.chapters[storageKey]?.quiz : undefined;
  const answeredCount = Object.keys(answers).length;

  function choose(questionId: string, optionIndex: number) {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
    setMissing((current) => current.filter((entry) => entry !== questionId));
  }

  function submit() {
    const unanswered = questions
      .filter((question) => answers[question.id] === undefined)
      .map((question) => question.id);

    if (unanswered.length > 0) {
      setMissing(unanswered);
      const firstMissing = unanswered[0];
      if (firstMissing) {
        document
          .getElementById(`${domId}-${firstMissing}`)
          ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    const scored = scoreQuiz(questions, answers);
    setResult(scored);
    if (storageKey) recordQuizAttempt(storageKey, scored.score, scored.total);
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setMissing([]);
  }

  return (
    <section
      className="not-prose border-border bg-surface my-10 rounded-lg border"
      aria-labelledby={`${domId}-title`}
      data-quiz-id={id}
    >
      <header className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
        <div>
          <h3 id={`${domId}-title`} className="text-text font-sans text-sm font-semibold">
            {title}
          </h3>
          <p className="tabular text-2xs text-faint mt-0.5">
            {questions.length} soal
            {hydrated && best
              ? ` · skor terbaik ${best.bestScore}/${best.total} dalam ${best.attempts}× percobaan`
              : ''}
          </p>
        </div>
        {result ? (
          <Button variant="ghost" size="sm" onClick={retry}>
            Ulangi
          </Button>
        ) : (
          <span className="tabular text-2xs text-faint">
            {answeredCount}/{questions.length} terjawab
          </span>
        )}
      </header>

      <ol className="divide-border divide-y">
        {questions.map((question, questionIndex) => {
          const chosen = answers[question.id];
          const outcome = result?.perQuestion.find((entry) => entry.id === question.id);
          const isMissing = missing.includes(question.id);

          return (
            <li
              key={question.id}
              id={`${domId}-${question.id}`}
              className={cn('px-5 py-4', isMissing && 'bg-warning-fill')}
            >
              <fieldset>
                <legend className="text-text font-sans text-sm font-medium">
                  <span className="tabular text-faint mr-2">{questionIndex + 1}.</span>
                  {question.question}
                </legend>

                {isMissing ? (
                  <p className="text-2xs text-warning mt-1 font-medium">Soal ini belum dijawab.</p>
                ) : null}

                <div className="mt-3 space-y-1.5">
                  {question.options.map((option, optionIndex) => {
                    const isChosen = chosen === optionIndex;
                    const isAnswer = outcome && optionIndex === outcome.correct;
                    const isWrongChoice = outcome && isChosen && !outcome.isCorrect;

                    return (
                      <label
                        key={optionIndex}
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-sm',
                          'duration-fast transition-colors',
                          !result && 'border-border hover:bg-raised',
                          !result && isChosen && 'border-border-strong bg-raised',
                          isAnswer && 'bg-accent-fill border-transparent',
                          isWrongChoice && 'bg-danger-fill border-transparent',
                          result && !isAnswer && !isWrongChoice && 'border-border opacity-70',
                          result && 'cursor-default',
                        )}
                      >
                        <input
                          type="radio"
                          name={`${domId}-${question.id}`}
                          checked={isChosen}
                          disabled={result !== null}
                          onChange={() => choose(question.id, optionIndex)}
                          className="mt-1 accent-[var(--primary)]"
                        />
                        <span className="text-text flex-1">{option}</span>
                        {isAnswer ? (
                          <span className="text-2xs text-accent flex shrink-0 items-center gap-1 font-semibold">
                            <CheckIcon size={13} />
                            Benar
                          </span>
                        ) : null}
                        {isWrongChoice ? (
                          <span className="text-2xs text-danger flex shrink-0 items-center gap-1 font-semibold">
                            <CloseIcon size={13} />
                            Jawabanmu
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                {outcome ? (
                  <p className="border-border-strong text-muted mt-3 border-l-2 pl-3 font-serif text-[0.95rem] leading-relaxed">
                    {question.explanation}
                  </p>
                ) : null}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <footer className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        {result ? (
          <p className="tabular text-text font-sans text-sm font-medium" aria-live="polite">
            Skor {result.score} dari {result.total}
            {result.score === result.total ? ' — semua benar.' : ''}
          </p>
        ) : (
          <>
            <p className="text-2xs text-faint">
              Jawab semua soal, lalu kirim untuk melihat penjelasannya.
            </p>
            <Button variant="primary" size="sm" onClick={submit}>
              Kirim jawaban
            </Button>
          </>
        )}
      </footer>
    </section>
  );
}
