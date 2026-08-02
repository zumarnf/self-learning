import { BACKUP_KEY, STORAGE_KEY, emptyData, parseLearningData, type LearningData } from './schema';

/**
 * The single door between the app and persistent storage.
 *
 * Every read and write goes through here, which is what makes ADR-0002's evolution path cheap:
 * adding a backend later means adding a second implementation of this module, not rewriting the
 * components that use it.
 *
 * Failures are surfaced, never swallowed. Storage can be full, blocked by a privacy setting, or
 * absent entirely — in each case the app degrades to memory-only and says so
 * (.claude/rules/frontend.md → UI states; backend.md → never swallow an error).
 */

export type StorageStatus = 'ok' | 'unavailable' | 'full' | 'read-error';

export type LoadResult = {
  data: LearningData;
  status: StorageStatus;
  /** Set when stored data was unreadable and a backup copy was kept aside. */
  recoveredFrom?: string;
};

function getLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const storage = window.localStorage;
    // Presence is not permission: Safari in private mode exposes the object but throws on write.
    const probe = '__rbf_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function load(): LoadResult {
  const storage = getLocalStorage();
  if (!storage) {
    return { data: emptyData(), status: 'unavailable' };
  }

  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('[storage] read failed', error);
    return { data: emptyData(), status: 'read-error' };
  }

  if (raw === null) {
    return { data: emptyData(), status: 'ok' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return keepBackupAndReset(storage, raw, 'Data tersimpan tidak bisa dibaca sebagai JSON.');
  }

  const result = parseLearningData(parsed);
  if (!result.ok) {
    return keepBackupAndReset(storage, raw, result.reason);
  }

  return { data: result.data, status: 'ok' };
}

/**
 * Corrupt data is never simply thrown away — losing a learner's history silently is worse than
 * the corruption itself. The raw string is moved to a backup key so it can be inspected or
 * repaired by hand.
 */
function keepBackupAndReset(storage: Storage, raw: string, reason: string): LoadResult {
  try {
    storage.setItem(BACKUP_KEY, raw);
  } catch (error) {
    console.error('[storage] could not keep a backup of the corrupt data', error);
  }
  return { data: emptyData(), status: 'read-error', recoveredFrom: reason };
}

export function save(data: LearningData): StorageStatus {
  const storage = getLocalStorage();
  if (!storage) return 'unavailable';

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return 'ok';
  } catch (error) {
    // QuotaExceededError is the realistic case. It must reach the user, because from here on
    // nothing they do is being remembered.
    console.error('[storage] write failed', error);
    return 'full';
  }
}

export function clear(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[storage] clear failed', error);
  }
}

export function readBackup(): string | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}
