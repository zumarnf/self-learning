/**
 * Join class names, dropping anything falsy.
 *
 * Deliberately not `tailwind-merge`: this codebase composes classes from design tokens rather
 * than overriding one utility with another, so conflict resolution would be solving a problem
 * we do not have. If a component ever genuinely needs to override a caller's utility, revisit
 * this — do not sprinkle `!important` instead.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
