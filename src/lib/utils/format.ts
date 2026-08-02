/**
 * Formatting helpers.
 *
 * Dates and numbers go through `Intl` rather than hand-written month names and separators:
 * hardcoded formats are a flagged anti-pattern, they ignore the reader's actual locale settings,
 * and they quietly break the moment anything needs a second language.
 */

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});

/** "95" → "1 jam 35 menit". Kept human rather than exact: nobody plans study time in seconds. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} menit`;
}

/** "2026-08-01" → "1 Agustus 2026". Returns the input unchanged if it is not a valid date. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateFormatter.format(date);
}

/** "2026-08-01T21:04:00Z" → "1 Agustus 2026, 21.04" in the reader's own timezone. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}
