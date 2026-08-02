import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Small shared primitives. Deliberately few and deliberately plain — the visual identity of this
 * site lives in typography and rhythm, not in decorated containers
 * (design direction: Editorial Docs + Modern Minimalism, ADR-0005).
 */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border-border bg-surface rounded-lg border', className)}>{children}</div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-2xs text-faint font-medium tracking-[0.1em] uppercase', className)}>
      {children}
    </p>
  );
}

type BadgeTone = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-border bg-raised text-muted',
  primary: 'border-border-strong bg-raised text-primary',
  accent: 'border-transparent bg-accent-fill text-accent',
  warning: 'border-transparent bg-warning-fill text-warning',
  danger: 'border-transparent bg-danger-fill text-danger',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'text-2xs inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Loading placeholder that reserves the final height, so nothing on the page jumps when data
 * arrives (.claude/rules/frontend.md → UI states, CLS budget).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-raised animate-pulse rounded-md', className)}
      aria-hidden="true"
      data-testid="skeleton"
    />
  );
}

/**
 * Empty state. An empty area with no explanation is a defect: it must say why it is empty and
 * offer one clear next action.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-start gap-3 rounded-lg border border-dashed px-6 py-8',
        className,
      )}
    >
      <p className="text-text font-medium">{title}</p>
      <p className="text-muted max-w-prose text-sm">{description}</p>
      {action}
    </div>
  );
}

/** Failure state. Never shows a raw exception — the reader gets something they can act on. */
export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('border-border bg-danger-fill rounded-lg border px-6 py-5', className)}
      role="alert"
    >
      <p className="text-danger font-medium">{title}</p>
      <p className="text-text mt-1 max-w-prose text-sm">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-border border-t', className)} />;
}
