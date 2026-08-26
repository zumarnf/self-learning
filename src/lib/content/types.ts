/**
 * Lesson content model.
 *
 * Lessons are data, not markup: an array of `Block` objects that one renderer turns into UI.
 * The union is discriminated on `kind`, and `BlockRenderer` exhausts it via `assertNever`, so
 * adding a block type here is a compile error until every renderer handles it (ADR-0003).
 *
 * Text fields support a small inline syntax handled by `parseInline`:
 *   `code`   **bold**   *italic*   [text](href)
 * That parser returns React nodes, never an HTML string — there is no `innerHTML` path for
 * lesson text (.claude/rules/security.md → XSS).
 */

/**
 * Languages the syntax highlighter is allowed to load. Keeping this closed keeps the Shiki
 * bundle bounded, and a curriculum integrity test fails if a lesson uses anything else.
 */
export const CODE_LANGUAGES = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'css',
  'json',
  'bash',
  'sql',
  'php',
  'yaml',
  'diff',
  'text',
] as const;

export type CodeLang = (typeof CODE_LANGUAGES)[number];

export type CalloutTone = 'info' | 'tip' | 'warning' | 'danger';

/**
 * Hosts a `references` block is allowed to point at.
 *
 * Without a closed list, "official documentation" degrades into "any link that looked credible
 * at the time". Every entry here is the vendor's or the standards body's own documentation
 * site — not a tutorial, a blog, or an aggregator. Adding a host is a deliberate decision that
 * shows up in the diff, which is the point (ADR-0006).
 *
 * Hostnames are matched exactly, including `www.`, because that is what `URL.hostname` returns
 * and a near-miss should fail loudly rather than be silently normalised.
 */
export const OFFICIAL_DOC_HOSTS = [
  // Web platform & language standards
  'developer.mozilla.org',
  'html.spec.whatwg.org',
  'dom.spec.whatwg.org',
  'fetch.spec.whatwg.org',
  'www.w3.org',
  'www.ecma-international.org',
  'tc39.es',
  'developer.chrome.com',
  'web.dev',
  // JavaScript / TypeScript tooling
  'nodejs.org',
  'docs.npmjs.com',
  'www.typescriptlang.org',
  'vitest.dev',
  'vite.dev',
  'eslint.org',
  'typescript-eslint.io',
  'prettier.io',
  'babeljs.io',
  // Frontend frameworks
  'react.dev',
  'nextjs.org',
  'tailwindcss.com',
  // React ecosystem libraries — each entry is the library's own docs site, published by its
  // maintainers. They are here for the same reason `react.dev` is: a lesson that teaches a
  // library must be able to point at that library's primary reference.
  'tanstack.com',
  'zustand.docs.pmnd.rs',
  'redux.js.org',
  'redux-toolkit.js.org',
  'jotai.org',
  'zod.dev',
  // Backend libraries — each entry is the library's own docs site
  'www.prisma.io',
  'docs.bullmq.io',
  'pestphp.com',
  'socket.io',
  // Backend
  'expressjs.com',
  'laravel.com',
  'www.php.net',
  'getcomposer.org',
  'jwt.io',
  // Databases
  'www.postgresql.org',
  'dev.mysql.com',
  'www.sqlite.org',
  'redis.io',
  // Infrastructure, delivery & operations
  'docs.docker.com',
  'git-scm.com',
  'docs.github.com',
  'vercel.com',
  'nginx.org',
  'httpd.apache.org',
  // Distributed data stores & streaming platforms — each is the project's own documentation.
  // Added for the System Design category, which must be able to point at the primary reference
  // for a storage or messaging model it compares rather than at a summary of one.
  'kafka.apache.org',
  'cassandra.apache.org',
  'www.mongodb.com',
  // Operations & observability — the projects that define these formats and probes
  'kubernetes.io',
  'prometheus.io',
  'opentelemetry.io',
  // Methodology & specification bodies that ARE the primary source for their concept
  '12factor.net',
  'spec.openapis.org',
  // Google's SRE books are the primary source for SLO, error budgets, and the four golden
  // signals. Nothing else defines those terms first-hand.
  'sre.google',
  // AI coding assistants & agent formats — each is the publisher's own documentation site.
  // Added for the Prompt Engineering category, which teaches how to work with these tools and
  // must be able to point at the vendor's primary reference rather than at a summary of one.
  // Both vendors moved their docs during 2026, so these are the hosts that actually serve the
  // pages today, verified by fetching them rather than recalled from memory.
  'platform.claude.com',
  'code.claude.com',
  'developers.openai.com',
  'learn.chatgpt.com',
  'agents.md',
  'modelcontextprotocol.io',
  // Software architecture methods & pattern catalogues. Each entry is the primary home of the
  // method itself or the vendor's own architecture documentation, which is the same
  // justification `12factor.net` and `agents.md` already carry. Added for the Architecture
  // Design category, which must be able to point at where a pattern is actually defined rather
  // than at someone's summary of it. Personal sites were rejected on purpose, however
  // well-regarded, because the allow-list would then have no edge left to defend.
  'c4model.com',
  'adr.github.io',
  'arc42.org',
  'learn.microsoft.com',
  'docs.aws.amazon.com',
  // Security & specifications
  'owasp.org',
  'cheatsheetseries.owasp.org',
  'www.rfc-editor.org',
  'datatracker.ietf.org',
] as const;

export type OfficialDocHost = (typeof OFFICIAL_DOC_HOSTS)[number];

/**
 * One unfamiliar token explained where it is used.
 *
 * Aimed at the abbreviations a beginner cannot decode from context — `fn`, `arr`, `req`/`res` —
 * which appear in almost every code sample and are never spelled out anywhere.
 */
export type TermEntry = {
  /** The token exactly as it appears in code or prose, e.g. `fn`. Rendered as code. */
  term: string;
  /** What it stands for and why it is written that way. Supports the inline syntax. */
  meaning: string;
};

/** One pointer to primary documentation, so the reader knows where to go deeper. */
export type DocReference = {
  /** What the page is called, e.g. `Array.prototype.map()`. */
  label: string;
  /** Absolute `https` URL whose hostname is in `OFFICIAL_DOC_HOSTS`. */
  href: string;
  /** Who publishes it, e.g. 'MDN'. Shown before the click, not after. */
  source: string;
  /** Optional one-line reason to open it, when the label alone is not enough. */
  note?: string;
};

export type QuizQuestion = {
  /** Stable id — quiz answers are stored per question, so this must not change casually. */
  id: string;
  question: string;
  options: string[];
  /** Index into `options`. Validated against `options.length` by the integrity test. */
  answerIndex: number;
  /** Why the correct option is correct. Shown for every question after submitting. */
  explanation: string;
};

export type ComparePane = {
  title: string;
  lang: CodeLang;
  code: string;
  notes?: string[];
};

export type Block =
  | { kind: 'heading'; level: 2 | 3; text: string; id?: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | {
      kind: 'code';
      lang: CodeLang;
      code: string;
      filename?: string;
      caption?: string;
    }
  | { kind: 'callout'; tone: CalloutTone; title?: string; body: string[] }
  // Both carry no title: the renderer supplies a fixed one, so the reader learns to recognise
  // these two boxes by shape across all 440 lessons instead of reading a different heading each
  // time.
  | { kind: 'terms'; items: TermEntry[] }
  | { kind: 'references'; items: DocReference[] }
  | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { kind: 'steps'; items: { title: string; body: string }[] }
  | { kind: 'compare'; left: ComparePane; right: ComparePane }
  | { kind: 'quiz'; id: string; questions: QuizQuestion[] }
  | { kind: 'checklist'; id: string; title: string; items: string[] }
  | {
      kind: 'playground';
      template: 'vanilla' | 'react';
      files: Record<string, string>;
      title?: string;
    }
  | { kind: 'divider' };

export type BlockKind = Block['kind'];

/**
 * Compile-time exhaustiveness guard. Reaching this at runtime means a `Block` variant was added
 * without a renderer, which the type system should already have caught.
 */
export function assertNever(value: never, context: string): never {
  throw new Error(`Unhandled ${context}: ${JSON.stringify(value)}`);
}
