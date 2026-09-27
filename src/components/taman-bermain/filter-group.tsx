'use client';

import { cn } from '@/lib/utils/cn';

/**
 * A row of filter buttons.
 *
 * Lifted from the pattern `/latihan` already uses — same markup, same `aria-pressed`, same look.
 * That is not cosmetic tidiness: a reader who learned how filtering works on the exercises page
 * should not have to learn it again here.
 */
export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-2xs text-faint w-16 shrink-0 tracking-[0.08em] uppercase">{label}</span>
      <div className="flex flex-wrap gap-1" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'duration-fast rounded-md border px-3 py-1.5 text-xs transition-colors',
              value === option.value
                ? 'border-border-strong bg-raised text-text font-medium'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
