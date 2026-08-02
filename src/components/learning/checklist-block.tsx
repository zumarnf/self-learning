'use client';

import { useId } from 'react';
import { Skeleton } from '@/components/ui/primitives';
import { togglePracticeItem, useLearningStore } from '@/lib/learning/store';
import { cn } from '@/lib/utils/cn';

/**
 * Practice checklist.
 *
 * State lives under the chapter key, so a lesson-level checklist and a chapter-level one share
 * the same storage shape and the Latihan page can count both without special cases.
 *
 * Until the store has hydrated, this renders a skeleton of the same height rather than an
 * all-unchecked list — showing "nothing done" and then flipping items on would be a lie the
 * reader sees (SRS FR-10.4).
 */
export function ChecklistBlock({
  id,
  title,
  items,
  storageKey,
}: {
  id: string;
  title: string;
  items: string[];
  /** `category/chapter`. Falls back to the block id when used outside a chapter context. */
  storageKey?: string;
}) {
  const domId = useId();
  const { data, hydrated } = useLearningStore();
  const key = storageKey ?? id;
  const practice = data.chapters[key]?.practice ?? {};
  const doneCount = items.filter((_, index) => practice[String(index)]).length;

  return (
    <section
      className="not-prose border-border bg-surface my-8 rounded-lg border px-5 py-4"
      aria-labelledby={`${domId}-title`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${domId}-title`} className="text-text font-sans text-sm font-semibold">
          {title}
        </h3>
        <span className="tabular text-2xs text-faint">
          {hydrated ? `${doneCount}/${items.length} selesai` : `${items.length} item`}
        </span>
      </div>

      {hydrated ? (
        <ul className="mt-3 space-y-1">
          {items.map((item, index) => {
            const checked = practice[String(index)] === true;
            return (
              <li key={index}>
                <label className="hover:bg-raised duration-fast flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePracticeItem(key, index)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <span className={cn('text-text flex-1', checked && 'text-faint line-through')}>
                    {item}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 space-y-2" aria-hidden="true">
          {items.map((_, index) => (
            <Skeleton key={index} className="h-7 w-full" />
          ))}
        </div>
      )}
    </section>
  );
}
