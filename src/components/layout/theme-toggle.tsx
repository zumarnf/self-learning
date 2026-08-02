'use client';

import { useEffect } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons';
import { setTheme, useLearningStore } from '@/lib/learning/store';
import type { ThemePreference } from '@/lib/learning/schema';
import { cn } from '@/lib/utils/cn';

/**
 * Three-position theme control: follow the system, force light, force dark.
 *
 * A two-position toggle cannot express "follow the system", which is the setting most people
 * actually want. The initial class is applied by the inline script in `layout.tsx`; this
 * component only keeps it in sync afterwards.
 */

const options: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: 'system', label: 'Ikuti sistem', icon: MonitorIcon },
  { value: 'light', label: 'Terang', icon: SunIcon },
  { value: 'dark', label: 'Gelap', icon: MoonIcon },
];

function applyTheme(preference: ThemePreference): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = preference === 'dark' || (preference === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

export function ThemeToggle() {
  const { data, hydrated } = useLearningStore();
  const current = data.preferences.theme;

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(current);

    // While on "system", the OS switching at sunset must take effect without a reload.
    if (current !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [current, hydrated]);

  return (
    <div
      className="border-border bg-surface flex items-center gap-0.5 rounded-md border p-0.5"
      role="group"
      aria-label="Tema tampilan"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = hydrated && current === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            title={label}
            className={cn(
              'duration-fast inline-flex h-7 w-7 items-center justify-center rounded-sm transition-colors',
              active ? 'bg-raised text-primary' : 'text-faint hover:text-text',
            )}
          >
            <Icon size={14} />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
