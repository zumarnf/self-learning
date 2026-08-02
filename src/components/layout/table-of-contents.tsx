'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * On-page table of contents with an active-section marker.
 *
 * Uses `IntersectionObserver` rather than a scroll listener: a scroll handler fires on every
 * frame and forces layout reads, which is exactly the pattern the DOM chapter of this curriculum
 * warns against.
 */
export function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(headings[0]?.id);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among everything currently in the top band of the viewport, the highest one wins.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="Daftar isi halaman">
      <p className="text-2xs text-faint font-medium tracking-[0.1em] uppercase">Di halaman ini</p>
      <ul className="border-border mt-3 space-y-px border-l">
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'duration-fast block py-1 pl-3 text-xs transition-colors',
                  active
                    ? 'border-primary-fill text-text -ml-px border-l-2 pl-[calc(0.75rem-1px)] font-medium'
                    : 'text-muted hover:text-text',
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
