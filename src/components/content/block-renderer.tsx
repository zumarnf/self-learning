import type { ReactNode } from 'react';
import { CopyButton } from '@/components/content/copy-button';
import { ChecklistBlock } from '@/components/learning/checklist-block';
import { PlaygroundBlock } from '@/components/learning/playground-block';
import { QuizBlock } from '@/components/learning/quiz-block';
import { DangerIcon, InfoIcon, TipIcon, WarningIcon } from '@/components/ui/icons';
import { highlightCode } from '@/lib/content/highlight';
import { parseInline } from '@/lib/content/parse-inline';
import { assertNever, type Block, type CalloutTone } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

/**
 * Turns lesson data into UI.
 *
 * A Server Component, so every static block costs zero client JavaScript. Only the three
 * genuinely interactive blocks (quiz, checklist, playground) cross into the client, and they do
 * so individually rather than dragging the whole lesson with them (SDD §2.3).
 *
 * The switch is exhaustive: adding a variant to `Block` without handling it here is a type
 * error, which is the whole point of the typed content model (ADR-0003).
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Heading ids power the on-page table of contents, so they must be derived the same way here. */
export function headingId(block: Extract<Block, { kind: 'heading' }>): string {
  return block.id ?? slugify(block.text);
}

const calloutTones: Record<
  CalloutTone,
  { label: string; icon: ReactNode; wrapper: string; accent: string }
> = {
  info: {
    label: 'Catatan',
    icon: <InfoIcon size={15} />,
    wrapper: 'border-border bg-raised',
    accent: 'text-muted',
  },
  tip: {
    label: 'Tips',
    icon: <TipIcon size={15} />,
    wrapper: 'border-transparent bg-accent-fill',
    accent: 'text-accent',
  },
  warning: {
    label: 'Peringatan',
    icon: <WarningIcon size={15} />,
    wrapper: 'border-transparent bg-warning-fill',
    accent: 'text-warning',
  },
  danger: {
    label: 'Bahaya',
    icon: <DangerIcon size={15} />,
    wrapper: 'border-transparent bg-danger-fill',
    accent: 'text-danger',
  },
};

async function CodeBlock({ block }: { block: Extract<Block, { kind: 'code' }> }) {
  const html = await highlightCode(block.code, block.lang);

  return (
    <figure className="not-prose my-8 max-w-[var(--container-code)]">
      <div className="border-code-border bg-code-bg overflow-hidden rounded-md border">
        <div className="border-code-border flex items-center justify-between gap-3 border-b px-3 py-1.5">
          <span className="text-2xs text-faint font-mono">{block.filename ?? block.lang}</span>
          <CopyButton value={block.code} />
        </div>
        {/*
          `dangerouslySetInnerHTML` appears in exactly two places in this file — here and in
          `CompareBlock` below — and nowhere else in the component tree. The input is Shiki's output
          over a code string that lives in this repository — never user input. Nothing a reader
          types (notes, playground code, imported JSON) may ever reach this path.
          See docs/adr/0004 and .claude/rules/security.md.
        */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {block.caption ? (
        <figcaption className="text-muted mt-2 text-xs">{parseInline(block.caption)}</figcaption>
      ) : null}
    </figure>
  );
}

function TableBlock({ block }: { block: Extract<Block, { kind: 'table' }> }) {
  return (
    <figure className="not-prose my-8">
      {/* The table scrolls inside its own box; the page body never scrolls sideways (FR-2.5). */}
      <div className="scroll-x border-border rounded-md border">
        <table className="w-full min-w-[32rem] border-collapse text-left font-sans text-sm">
          <thead>
            <tr className="border-border bg-raised border-b">
              {block.head.map((cell, i) => (
                <th key={i} scope="col" className="text-text px-3 py-2 font-medium">
                  {parseInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-border border-b last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="text-muted px-3 py-2 align-top">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption ? (
        <figcaption className="text-muted mt-2 text-xs">{parseInline(block.caption)}</figcaption>
      ) : null}
    </figure>
  );
}

async function CompareBlock({ block }: { block: Extract<Block, { kind: 'compare' }> }) {
  const [leftHtml, rightHtml] = await Promise.all([
    highlightCode(block.left.code, block.left.lang),
    highlightCode(block.right.code, block.right.lang),
  ]);

  const panes = [
    { pane: block.left, html: leftHtml },
    { pane: block.right, html: rightHtml },
  ];

  return (
    <div className="not-prose my-8 grid gap-4 md:grid-cols-2">
      {panes.map(({ pane, html }, i) => (
        <div key={i} className="border-code-border overflow-hidden rounded-md border">
          <p className="border-code-border bg-raised text-2xs text-muted border-b px-3 py-1.5 font-medium tracking-[0.08em] uppercase">
            {pane.title}
          </p>
          {/* Same guarantee as `CodeBlock` above: the only thing ever passed here is Shiki's
              output over a code string from this repository. No reader input reaches it. */}
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {pane.notes && pane.notes.length > 0 ? (
            <ul className="border-code-border text-muted space-y-1 border-t px-3 py-2 text-xs">
              {pane.notes.map((note, noteIndex) => (
                <li key={noteIndex}>{parseInline(note)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

async function renderBlock(block: Block, index: number): Promise<ReactNode> {
  switch (block.kind) {
    case 'heading': {
      const id = headingId(block);
      return block.level === 2 ? (
        <h2 key={index} id={id}>
          {parseInline(block.text)}
        </h2>
      ) : (
        <h3 key={index} id={id}>
          {parseInline(block.text)}
        </h3>
      );
    }

    case 'paragraph':
      return <p key={index}>{parseInline(block.text)}</p>;

    case 'list':
      return block.ordered ? (
        <ol key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );

    case 'code':
      return <CodeBlock key={index} block={block} />;

    case 'callout': {
      const tone = calloutTones[block.tone];
      return (
        <aside
          key={index}
          className={cn('not-prose my-8 rounded-md border px-4 py-3.5', tone.wrapper)}
        >
          {/* The tone is carried by an icon AND a word, never by colour alone (NFR-A4). */}
          <p
            className={cn(
              'text-2xs flex items-center gap-2 font-semibold tracking-[0.08em] uppercase',
              tone.accent,
            )}
          >
            {tone.icon}
            <span>{block.title ?? tone.label}</span>
          </p>
          <div className="text-text mt-2 space-y-2 font-serif text-[0.95rem] leading-relaxed">
            {block.body.map((line, i) => (
              <p key={i}>{parseInline(line)}</p>
            ))}
          </div>
        </aside>
      );
    }

    case 'table':
      return <TableBlock key={index} block={block} />;

    case 'steps':
      return (
        <ol key={index} className="not-prose my-8 space-y-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="tabular border-border bg-raised text-2xs text-muted mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border font-medium">
                {i + 1}
              </span>
              <div>
                <p className="text-text font-sans text-sm font-medium">{parseInline(item.title)}</p>
                <p className="text-muted mt-1 font-serif text-[0.98rem] leading-relaxed">
                  {parseInline(item.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      );

    case 'compare':
      return <CompareBlock key={index} block={block} />;

    case 'quiz':
      return <QuizBlock key={index} id={block.id} questions={block.questions} />;

    case 'checklist':
      return <ChecklistBlock key={index} id={block.id} title={block.title} items={block.items} />;

    case 'playground':
      return (
        <PlaygroundBlock
          key={index}
          template={block.template}
          files={block.files}
          title={block.title}
        />
      );

    case 'divider':
      return <hr key={index} className="not-prose border-border my-10 border-t" />;

    default:
      return assertNever(block, 'block kind');
  }
}

export async function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const rendered = await Promise.all(blocks.map((block, index) => renderBlock(block, index)));
  return <>{rendered}</>;
}
