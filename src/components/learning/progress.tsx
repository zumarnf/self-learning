'use client';

import { FlameIcon } from '@/components/ui/icons';
import type { ProgressCounts } from '@/lib/learning/derive';
import { cn } from '@/lib/utils/cn';

/**
 * Progress indicators.
 *
 * Every one of them pairs the visual with a readable number, and exposes `role="progressbar"`
 * with real values — a bar whose only content is a coloured rectangle tells a screen-reader user
 * nothing (NFR-A: progress must be readable as text too).
 */

export function ProgressBar({
  progress,
  label,
  className,
  showTicks = true,
}: {
  progress: ProgressCounts;
  label: string;
  className?: string;
  showTicks?: boolean;
}) {
  return (
    <div
      className={cn('bg-sunken relative h-1.5 w-full overflow-hidden rounded-full', className)}
      role="progressbar"
      aria-valuenow={progress.percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${progress.done} dari ${progress.total} sub-bab`}
    >
      <div
        className="bg-primary-fill duration-slow ease-out-ui h-full origin-left rounded-full transition-transform"
        style={{ transform: `scaleX(${progress.percent / 100})`, width: '100%' }}
      />
      {/* Quarter ticks — a plain bar reads as decoration; marked quarters read as a measure. */}
      {showTicks ? (
        <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
          <span className="border-bg w-1/4 border-r" />
          <span className="border-bg w-1/4 border-r" />
          <span className="border-bg w-1/4 border-r" />
          <span className="w-1/4" />
        </div>
      ) : null}
    </div>
  );
}

export function ProgressRing({
  progress,
  label,
  size = 108,
}: {
  progress: ProgressCounts;
  label: string;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress.percent / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="progressbar"
      aria-valuenow={progress.percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${progress.done} dari ${progress.total} sub-bab`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--sunken)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary-fill)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="duration-slow ease-out-ui transition-[stroke-dashoffset]"
        />
      </svg>
      <span className="tabular text-text absolute font-sans text-xl font-semibold">
        {progress.percent}%
      </span>
    </div>
  );
}

export function StreakBadge({ days }: { days: number }) {
  if (days === 0) {
    return <span className="text-2xs text-faint">Belum ada streak</span>;
  }

  return (
    <span className="text-2xs text-primary inline-flex items-center gap-1.5 font-medium">
      <FlameIcon size={13} />
      <span className="tabular">
        Streak {days} hari{days >= 7 ? ' berturut-turut' : ''}
      </span>
    </span>
  );
}
