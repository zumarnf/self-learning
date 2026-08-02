'use client';

import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { ChevronRightIcon, RepeatIcon } from '@/components/ui/icons';
import { Card, Eyebrow, Skeleton } from '@/components/ui/primitives';
import { ProgressBar, ProgressRing, StreakBadge } from '@/components/learning/progress';
import {
  categoryProgress,
  collectReviewList,
  computeStreak,
  overallProgress,
  recentActivity,
  resolveContinue,
} from '@/lib/learning/derive';
import { useLearningStore } from '@/lib/learning/store';
import type { DashboardData } from './page';

/**
 * Dashboard — the daily entry point.
 *
 * Every number here comes from the learner's own stored data. Nothing is invented, estimated, or
 * borrowed from elsewhere: an inflated statistic on a personal learning tool would be lying to
 * the only person who reads it (PRD principle 5).
 */
export function DashboardClient({ curriculum, lessons, totals, start }: DashboardData) {
  const { data, hydrated } = useLearningStore();

  if (!hydrated) return <DashboardSkeleton />;

  const overall = overallProgress(data, curriculum);
  const next = resolveContinue(data, lessons);
  const streak = computeStreak(data.activity, new Date());
  const review = collectReviewList(data, lessons);
  const activity = recentActivity(data.activity, new Date(), 30);
  const hasStarted = overall.done > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
      {hasStarted ? (
        <>
          <header>
            <h1 className="text-text font-sans text-2xl font-semibold tracking-tight md:text-3xl">
              Selamat datang kembali.
            </h1>
            <p className="tabular text-muted mt-2">
              Kamu sudah menyelesaikan {overall.done} dari {overall.total} sub-bab.
            </p>
          </header>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.6fr_1fr]">
            {next ? (
              <Card className="flex flex-col justify-between p-6">
                <div>
                  <Eyebrow>Lanjutkan belajar</Eyebrow>
                  <p className="text-muted mt-3 text-xs">
                    {next.categoryTitle} · Bab {next.chapterNumber} {next.chapterTitle}
                  </p>
                  <p className="text-text mt-1 font-sans text-lg font-medium">
                    <span className="tabular text-faint mr-2">{next.number}</span>
                    {next.title}
                  </p>
                  <p className="tabular text-faint mt-1 text-xs">± {next.minutes} menit</p>
                </div>
                <ButtonLink
                  variant="primary"
                  className="mt-6 self-start"
                  href={`/kelas/${next.key}`}
                >
                  Lanjutkan
                  <ChevronRightIcon size={15} />
                </ButtonLink>
              </Card>
            ) : (
              <Card className="p-6">
                <Eyebrow>Selesai</Eyebrow>
                <p className="text-text mt-3 font-sans text-lg font-medium">
                  Seluruh kurikulum sudah kamu selesaikan.
                </p>
                <p className="text-muted mt-2 text-sm">
                  Waktunya membangun sesuatu sendiri — atau meninjau ulang sub-bab yang kamu tandai.
                </p>
              </Card>
            )}

            <Card className="flex flex-col items-center justify-center gap-3 p-6">
              <ProgressRing progress={overall} label="Progres keseluruhan" />
              <p className="tabular text-muted text-xs">
                {overall.done} / {overall.total} sub-bab
              </p>
              <StreakBadge days={streak.current} />
            </Card>
          </div>

          <section className="mt-10">
            <h2 className="text-text font-sans text-sm font-semibold">Progres per kategori</h2>
            <ul className="divide-border border-border mt-3 divide-y overflow-hidden rounded-lg border">
              {curriculum.map((category) => {
                const progress = categoryProgress(data, category);
                return (
                  <li key={category.slug}>
                    <Link
                      href={`/kelas/${category.slug}`}
                      className="hover:bg-raised duration-fast flex items-center gap-4 px-4 py-3 transition-colors"
                    >
                      <span className="tabular text-faint w-4 shrink-0 text-xs">
                        {category.order}
                      </span>
                      <span className="text-text w-44 shrink-0 truncate text-sm">
                        {category.title}
                      </span>
                      <ProgressBar
                        progress={progress}
                        label={category.title}
                        className="hidden flex-1 sm:block"
                      />
                      <span className="tabular text-muted w-10 shrink-0 text-right text-xs">
                        {progress.percent}%
                      </span>
                      <span className="tabular text-faint hidden w-16 shrink-0 text-right text-xs sm:block">
                        {progress.done}/{progress.total}
                      </span>
                      <ChevronRightIcon size={14} className="text-faint shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-text font-sans text-sm font-semibold">Perlu diulang</h2>
                <span className="tabular text-2xs text-faint">{review.length}</span>
              </div>
              {review.length === 0 ? (
                <p className="text-muted mt-3 text-sm">
                  Belum ada sub-bab yang kamu tandai. Tandai saat ada yang belum benar-benar
                  menempel — daftarnya akan muncul di sini.
                </p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {review.slice(0, 6).map((item) => (
                    <li key={item.key}>
                      <Link
                        href={`/kelas/${item.key}`}
                        className="text-muted hover:bg-raised hover:text-text duration-fast flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                      >
                        <RepeatIcon size={12} className="text-primary shrink-0" />
                        <span className="tabular text-faint text-xs">{item.number}</span>
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-text font-sans text-sm font-semibold">Aktivitas 30 hari</h2>
              <ActivityStrip activity={activity} />
              <p className="tabular text-2xs text-faint mt-3">
                Streak terpanjang: {streak.longest} hari
              </p>
            </Card>
          </div>
        </>
      ) : (
        <EmptyDashboard curriculum={curriculum} totals={totals} start={start} />
      )}
    </div>
  );
}

function ActivityStrip({ activity }: { activity: { day: string; count: number }[] }) {
  const max = Math.max(1, ...activity.map((entry) => entry.count));

  return (
    <div
      className="mt-4 flex h-16 items-end gap-[3px]"
      role="img"
      aria-label="Aktivitas 30 hari terakhir"
    >
      {activity.map((entry) => (
        <div
          key={entry.day}
          title={`${entry.day}: ${entry.count} aktivitas`}
          className="bg-primary-fill flex-1 rounded-[2px]"
          style={{
            height: entry.count === 0 ? '3px' : `${Math.max(12, (entry.count / max) * 100)}%`,
            opacity: entry.count === 0 ? 0.18 : 0.55 + (entry.count / max) * 0.45,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The empty state carries real information: what the curriculum contains and exactly where to
 * start. A dashboard full of zeroes explains nothing (FR-6.2).
 */
function EmptyDashboard({
  curriculum,
  totals,
  start,
}: Pick<DashboardData, 'curriculum' | 'totals' | 'start'>) {
  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <h1 className="text-text font-sans text-2xl font-semibold tracking-tight md:text-3xl">
        Belum ada yang dimulai — itu wajar.
      </h1>
      <p className="text-muted mx-auto mt-4 max-w-prose">
        Kurikulum ini punya {totals.categories} tahap, {totals.chapters} bab, dan {totals.lessons}{' '}
        sub-bab, dari JavaScript dari nol sampai men-deploy aplikasi fullstack ke produksi.
      </p>

      {start ? (
        <Card className="mt-8 p-6 text-left">
          <Eyebrow>Titik masuk yang disarankan</Eyebrow>
          <p className="text-muted mt-3 text-xs">
            {start.categoryTitle} · Bab {start.chapterNumber} {start.chapterTitle}
          </p>
          <p className="text-text mt-1 font-sans text-lg font-medium">
            <span className="tabular text-faint mr-2">{start.number}</span>
            {start.title}
          </p>
          <p className="tabular text-faint mt-1 text-xs">± {start.minutes} menit</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink variant="primary" href={`/kelas/${start.key}`}>
              Mulai belajar
              <ChevronRightIcon size={15} />
            </ButtonLink>
            <ButtonLink href="/roadmap">Lihat roadmap dulu</ButtonLink>
          </div>
        </Card>
      ) : null}

      <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
        {curriculum.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/kelas/${category.slug}`}
              className="border-border hover:bg-raised duration-fast flex items-baseline gap-2 rounded-md border px-3 py-2.5 transition-colors"
            >
              <span className="tabular text-faint text-xs">{category.order}</span>
              <span className="text-text flex-1 text-sm">{category.title}</span>
              <span className="tabular text-2xs text-faint">{category.lessonCount} sub-bab</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-3 h-5 w-56" />
      <div className="mt-8 grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="mt-10 h-6 w-40" />
      <Skeleton className="mt-3 h-64" />
    </div>
  );
}
