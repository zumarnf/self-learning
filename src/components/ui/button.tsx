import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * Button and ButtonLink.
 *
 * The API takes `variant`/`size` rather than `isPrimary`/`isSmall`/`isDanger`. Boolean props
 * that switch appearance multiply combinations that make no sense (`isPrimary` + `isGhost`) and
 * make call sites unreadable — the exact pattern `vercel-composition-patterns` warns about.
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
  'duration-fast ease-out-ui disabled:opacity-50 ' +
  'disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  // The amber fill always carries dark text on top, never light — that pairing is what keeps it
  // above 4.5:1 in both themes (ADR-0005).
  primary: 'bg-primary-fill text-on-primary-fill hover:brightness-[0.94]',
  secondary: 'border border-border bg-surface text-text hover:bg-raised hover:border-border-strong',
  ghost: 'text-muted hover:text-text hover:bg-raised',
  danger: 'border border-border bg-surface text-danger hover:bg-danger-fill',
};

const sizes: Record<Size, string> = {
  // Minimum 44px touch target on the default size (.claude/rules/frontend.md).
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = 'secondary',
  size = 'md',
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
