'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SearchIcon } from '@/components/ui/icons';
import { EmptyState, Eyebrow } from '@/components/ui/primitives';
import { glossary } from '@/content/glossary';
import type { NavCategory } from '@/lib/curriculum/queries';
import { cn } from '@/lib/utils/cn';

/**
 * Searchable glossary.
 *
 * Terms are matched against name, aliases, and definition, so looking up "TDZ" finds "Temporal
 * Dead Zone" and searching "prototype" finds every entry that mentions it.
 */
export function GlosariumClient({ categories }: { categories: NavCategory[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('semua');

  // Filtering ~35 entries on every keystroke is far cheaper than the bookkeeping a manual
  // `useMemo` would add — and React Compiler memoizes this automatically anyway.
  const normalised = query.trim().toLowerCase();
  const visible = glossary
    .filter((entry) => category === 'semua' || entry.category === category)
    .filter((entry) => {
      if (normalised.length === 0) return true;
      const haystack = [entry.term, entry.definition, ...(entry.aliases ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalised);
    })
    .sort((a, b) => a.term.localeCompare(b.term, 'id'));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Rujukan cepat</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Glosarium
        </h1>
        <p className="tabular text-muted mt-3 max-w-prose">
          {glossary.length} istilah yang muncul di kurikulum, dengan satu definisi yang disepakati
          dan tautan ke tempat ia dibahas.
        </p>
      </header>

      <div className="relative mt-8">
        <SearchIcon
          size={15}
          className="text-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <label htmlFor="cari-istilah" className="sr-only">
          Cari istilah
        </label>
        <input
          id="cari-istilah"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari istilah atau isi definisinya…"
          className="border-border bg-surface text-text placeholder:text-faint w-full rounded-md border py-2 pr-3 pl-9 text-sm"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Saring per kategori">
        <FilterChip active={category === 'semua'} onClick={() => setCategory('semua')}>
          Semua
        </FilterChip>
        {categories.map((item) => (
          <FilterChip
            key={item.slug}
            active={category === item.slug}
            onClick={() => setCategory(item.slug)}
          >
            {item.title}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-8"
          title={`Tidak ada istilah yang cocok dengan "${query.trim()}"`}
          description="Coba kata yang lebih pendek, atau ganti saringan kategorinya."
        />
      ) : (
        <dl className="divide-border border-border mt-8 divide-y overflow-hidden rounded-lg border">
          {visible.map((entry) => (
            <div key={entry.term} className="px-5 py-4">
              <dt className="flex flex-wrap items-baseline gap-2">
                <span className="text-text font-sans text-base font-medium">{entry.term}</span>
                {entry.aliases?.map((alias) => (
                  <span key={alias} className="text-2xs text-faint">
                    ({alias})
                  </span>
                ))}
              </dt>
              <dd className="text-muted mt-1.5 font-serif text-[0.98rem] leading-relaxed">
                {entry.definition}
              </dd>
              {entry.lesson ? (
                <dd className="mt-2">
                  <Link
                    href={`/kelas/${entry.lesson}`}
                    className="text-primary text-xs underline underline-offset-2"
                  >
                    Baca materinya →
                  </Link>
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'duration-fast rounded-md border px-2.5 py-1 text-xs transition-colors',
        active
          ? 'border-border-strong bg-raised text-text font-medium'
          : 'border-border text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}
