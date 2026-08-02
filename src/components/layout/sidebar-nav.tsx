'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { stripInline } from '@/lib/content/parse-inline';
import { CheckIcon, ChevronDownIcon } from '@/components/ui/icons';
import type { NavCategory } from '@/lib/curriculum/queries';
import { lessonKey } from '@/lib/curriculum/types';
import { useLearningStore } from '@/lib/learning/store';
import { cn } from '@/lib/utils/cn';

/**
 * Curriculum tree in the sidebar.
 *
 * Only the branch containing the current lesson is expanded. Showing all 31 chapters and 330
 * lessons at once would be a wall of text that is impossible to scan — the sidebar's job is
 * "where am I and what is next", not "here is everything".
 */
export function SidebarNav({
  navigation,
  onNavigate,
}: {
  navigation: NavCategory[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data, hydrated } = useLearningStore();

  const active = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    // /kelas/[category]/[chapter]/[lesson]
    if (parts[0] !== 'kelas') return { category: undefined, chapter: undefined, lesson: undefined };
    return { category: parts[1], chapter: parts[2], lesson: parts[3] };
  }, [pathname]);

  return (
    <nav aria-label="Kurikulum" className="pb-12">
      <p className="text-2xs text-faint px-3 pb-2 font-medium tracking-[0.1em] uppercase">
        Kurikulum
      </p>
      <ul className="space-y-0.5">
        {navigation.map((category) => (
          <CategoryBranch
            key={category.slug}
            categorySlug={category.slug}
            title={category.title}
            order={category.order}
            chapters={category.chapters.map((chapter) => ({
              slug: chapter.slug,
              number: chapter.number,
              title: chapter.title,
              lessons: chapter.lessons.map((lesson) => ({
                slug: lesson.slug,
                index: lesson.index,
                title: lesson.title,
                done: hydrated
                  ? data.lessons[lessonKey(category.slug, chapter.slug, lesson.slug)]
                      ?.completedAt !== undefined
                  : false,
              })),
            }))}
            active={active}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}

type ChapterNode = {
  slug: string;
  number: number;
  title: string;
  lessons: { slug: string; index: number; title: string; done: boolean }[];
};

function CategoryBranch({
  categorySlug,
  title,
  order,
  chapters,
  active,
  onNavigate,
}: {
  categorySlug: string;
  title: string;
  order: number;
  chapters: ChapterNode[];
  active: {
    category?: string | undefined;
    chapter?: string | undefined;
    lesson?: string | undefined;
  };
  onNavigate?: (() => void) | undefined;
}) {
  const isActive = active.category === categorySlug;
  const [open, setOpen] = useState(isActive);
  const expanded = open || isActive;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={expanded}
        className={cn(
          'duration-fast flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
          isActive ? 'text-text font-medium' : 'text-muted hover:bg-raised hover:text-text',
        )}
      >
        <span className="tabular text-2xs text-faint">{order}</span>
        <span className="flex-1">{title}</span>
        <ChevronDownIcon
          size={13}
          className={cn(
            'text-faint duration-normal shrink-0 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded ? (
        <ul className="border-border mt-0.5 ml-4 space-y-0.5 border-l pl-3">
          {chapters.map((chapter) => (
            <ChapterBranch
              key={chapter.slug}
              categorySlug={categorySlug}
              chapter={chapter}
              active={active}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function ChapterBranch({
  categorySlug,
  chapter,
  active,
  onNavigate,
}: {
  categorySlug: string;
  chapter: ChapterNode;
  active: {
    category?: string | undefined;
    chapter?: string | undefined;
    lesson?: string | undefined;
  };
  onNavigate?: (() => void) | undefined;
}) {
  const isActive = active.category === categorySlug && active.chapter === chapter.slug;
  const [open, setOpen] = useState(isActive);
  const expanded = open || isActive;

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={`/kelas/${categorySlug}/${chapter.slug}`}
          onClick={onNavigate}
          className={cn(
            'duration-fast flex-1 rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive ? 'text-text font-medium' : 'text-muted hover:bg-raised hover:text-text',
          )}
        >
          <span className="tabular text-2xs text-faint mr-1.5">{chapter.number}</span>
          {chapter.title}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Tutup' : 'Buka'} daftar sub-bab ${chapter.title}`}
          className="text-faint hover:text-text inline-flex h-7 w-7 items-center justify-center rounded-sm"
        >
          <ChevronDownIcon
            size={12}
            className={cn('duration-normal transition-transform', !expanded && '-rotate-90')}
          />
        </button>
      </div>

      {expanded ? (
        <ul className="border-border mb-1 ml-2 space-y-px border-l pl-2">
          {chapter.lessons.map((lesson) => {
            const isCurrent = isActive && active.lesson === lesson.slug;
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/kelas/${categorySlug}/${chapter.slug}/${lesson.slug}`}
                  onClick={onNavigate}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'duration-fast flex items-center gap-2 rounded-sm py-1 pr-2 pl-2 text-xs transition-colors',
                    // The active lesson gets an amber bar on the left — the one place the
                    // signature colour appears in navigation.
                    isCurrent
                      ? 'border-primary-fill text-text -ml-[2px] border-l-2 pl-[calc(0.5rem-2px)] font-medium'
                      : lesson.done
                        ? 'text-faint hover:text-muted'
                        : 'text-muted hover:bg-raised hover:text-text',
                  )}
                >
                  <span className="tabular text-faint shrink-0">
                    {chapter.number}.{lesson.index}
                  </span>
                  <span className="flex-1 truncate">{stripInline(lesson.title)}</span>
                  {lesson.done ? (
                    <>
                      <CheckIcon size={11} className="text-accent shrink-0" />
                      <span className="sr-only">selesai</span>
                    </>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
