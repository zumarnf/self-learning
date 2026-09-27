import type { GivenCode } from '@/lib/taman-bermain/types';

/**
 * The schema every SQL exercise is written against, shown to the learner as given code.
 *
 * Deliberately small and deliberately PostgreSQL: the curriculum's SQL chapter was run against
 * PostgreSQL 16.15, and several exercises turn on behaviour specific to it — double quotes name an
 * identifier, a `REFERENCES` column gets no index automatically, and `HAVING` cannot refer to an
 * output alias. Every answer key was executed against that version (plans/taman-bermain §2.8).
 */
export const SKEMA_TOKO: GivenCode = {
  file: 'db/skema.sql',
  lang: 'sql',
  code: `
    CREATE TABLE pengguna (
      id          SERIAL PRIMARY KEY,
      nama        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      kota        TEXT,
      dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE pesanan (
      id          SERIAL PRIMARY KEY,
      pengguna_id INT NOT NULL REFERENCES pengguna (id),
      total       INT NOT NULL,
      status      TEXT NOT NULL,
      dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `,
};
