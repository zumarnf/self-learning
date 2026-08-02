import type { ReactNode } from 'react';

/**
 * Inline formatting for lesson text.
 *
 * Supported: `code`, **bold**, *italic*, [text](href).
 *
 * This returns React nodes rather than an HTML string on purpose. Lesson text therefore never
 * reaches `innerHTML`, which removes an entire XSS class structurally instead of defending
 * against it (.claude/rules/security.md → Cross-Site Scripting).
 *
 * Anything that does not match a complete pattern is emitted as literal text. A stray backtick
 * or an unclosed bracket renders as itself; it never swallows the rest of the paragraph.
 */

const INLINE_PATTERN = /`([^`]+)`|\*\*([^*]+?)\*\*|\*([^*]+?)\*|\[([^\]]+)\]\(([^\s)]+)\)/g;

/** Nesting is allowed (bold containing code, say) but bounded so malformed input cannot recurse. */
const MAX_DEPTH = 3;

/**
 * Only these destinations may become a link. Everything else — `javascript:`, `data:`, and any
 * other scheme — is rendered as plain text rather than silently becoming a live link
 * (.claude/rules/security.md → validate redirect targets, avoid open redirects).
 */
function isAllowedHref(href: string): boolean {
  if (href.startsWith('/') || href.startsWith('#')) return true;
  if (href.startsWith('https://') || href.startsWith('http://')) return true;
  if (href.startsWith('mailto:')) return true;
  return false;
}

function isExternal(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function parseInline(text: string, depth = 0): ReactNode[] {
  if (text.length === 0) return [];
  if (depth >= MAX_DEPTH) return [text];

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // `matchAll` needs the /g flag, which carries mutable lastIndex state — build a fresh regex
  // per call so concurrent renders cannot interfere with each other.
  const pattern = new RegExp(INLINE_PATTERN.source, 'g');

  for (const match of text.matchAll(pattern)) {
    const start = match.index;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const [full, codeText, boldText, italicText, linkText, linkHref] = match;

    if (codeText !== undefined) {
      nodes.push(<code key={key++}>{codeText}</code>);
    } else if (boldText !== undefined) {
      nodes.push(<strong key={key++}>{parseInline(boldText, depth + 1)}</strong>);
    } else if (italicText !== undefined) {
      nodes.push(<em key={key++}>{parseInline(italicText, depth + 1)}</em>);
    } else if (linkText !== undefined && linkHref !== undefined) {
      if (isAllowedHref(linkHref)) {
        const external = isExternal(linkHref);
        nodes.push(
          <a
            key={key++}
            href={linkHref}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {parseInline(linkText, depth + 1)}
          </a>,
        );
      } else {
        // Disallowed scheme: keep the author's characters visible so the mistake is obvious.
        nodes.push(full);
      }
    }

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
