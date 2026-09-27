import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SoalClient } from './soal-client';
import { highlightCode } from '@/lib/content/highlight';
import { stripInline } from '@/lib/content/parse-inline';
import type { CodeLang } from '@/lib/content/types';
import { getCurriculum } from '@/lib/curriculum/queries';
import { findExercise, getExercises, getNeighbours } from '@/lib/taman-bermain/queries';
import type { Exercise } from '@/lib/taman-bermain/types';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getExercises().map((exercise) => ({ slug: exercise.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const exercise = findExercise(slug);
  if (!exercise) return { title: 'Soal tidak ditemukan' };
  return { title: stripInline(exercise.title), description: stripInline(exercise.realWorldUse) };
}

/** Highlighting language for the answer key and its variants. */
function bahasaSorotan(exercise: Exercise): CodeLang {
  if (exercise.codeLang) return exercise.codeLang;
  return exercise.check.engine === 'struktur' ? exercise.check.bahasa : 'js';
}

/**
 * One exercise.
 *
 * Shiki runs HERE, on the server, over every piece of code the page shows: the given code, the
 * answer key, each alternative answer, and each common mistake. All of it is code from this
 * repository. The client receives finished HTML and never highlights anything itself, which keeps
 * the highlighter out of the browser bundle (ADR-0004) and keeps `dangerouslySetInnerHTML`
 * pointed at something no reader can influence.
 *
 * The check spec and answer key DO cross into the client, and that is unavoidable without a
 * server (ADR-0002). It is stated openly in PRD §7 R-2 rather than presented as secure.
 */
export default async function SoalPage({ params }: Params) {
  const { slug } = await params;
  const exercise = findExercise(slug);

  if (!exercise) notFound();

  const kurikulum = getCurriculum();
  const kategori = kurikulum.find((c) => c.slug === exercise.source.category);
  const bab = kategori?.chapters.find((c) => c.slug === exercise.source.chapter);

  const bahasa = bahasaSorotan(exercise);
  const [solutionHtml, alternativesHtml, mistakeHtml, givenHtml] = await Promise.all([
    highlightCode(exercise.solution.code, bahasa),
    Promise.all(exercise.alternativeSolutions.map((kode) => highlightCode(kode, bahasa))),
    Promise.all(exercise.rejectedSolutions.map((r) => highlightCode(r.code, bahasa))),
    exercise.brief.given
      ? highlightCode(exercise.brief.given.code, exercise.brief.given.lang)
      : Promise.resolve(null),
  ]);

  const { previous, next } = getNeighbours(slug);

  return (
    <SoalClient
      exercise={exercise}
      highlighted={{
        solution: solutionHtml,
        alternatives: alternativesHtml,
        mistakes: exercise.rejectedSolutions.map((r, i) => ({
          reason: r.reason,
          html: mistakeHtml[i] ?? '',
        })),
        given: givenHtml,
      }}
      chapter={
        kategori && bab
          ? {
              title: `${kategori.title} · Bab ${bab.number} · ${bab.title}`,
              href: `/kelas/${kategori.slug}/${bab.slug}`,
            }
          : null
      }
      previous={previous ? { slug: previous.slug, title: previous.title } : null}
      next={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}
