import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * ESLint flat config.
 *
 * `eslint-config-next` v16 ships flat-config arrays directly, so they are spread in as-is.
 * Do NOT wrap them in `FlatCompat` — that helper is for legacy `.eslintrc` shapes and fails with
 * a circular-structure error against these.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'coverage/**',
      'next-env.d.ts',
      // Shared tooling folder, copied between projects and not part of this application.
      // Linting it would report on code this project does not own or ship.
      '.claude/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // Scoped to the files the TypeScript plugin is registered for. Rules that belong to a plugin
    // must live in the same config object that defines it, which is why `react/*` overrides are
    // left to the Next.js presets above rather than repeated here.
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    rules: {
      // Unused variables are a defect, not a warning — but allow the `_` prefix escape hatch
      // for intentionally ignored bindings (.claude/rules/code-style.md).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Type-only imports must be explicit; `verbatimModuleSyntax` is on in tsconfig.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Silently swallowing an error turns a loud failure into silent corruption
      // (.claude/rules/backend.md, code-style.md).
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },
];

export default config;
