import { describe, expect, it } from 'vitest';
import {
  chapterProgress,
  collectNotes,
  collectReviewList,
  computeStreak,
  findOrphanedKeys,
  overallProgress,
  recentActivity,
  resolveContinue,
  scoreQuiz,
  toLocalDay,
} from '@/lib/learning/derive';
import { emptyData, type LearningData } from '@/lib/learning/schema';
import { flattenLessons, getCurriculum } from '@/lib/curriculum/queries';

/**
 * Pure derivation functions. No storage, no React, no jsdom needed — which is exactly why they
 * were written as pure functions in the first place (SDD §5.4).
 */

const curriculum = getCurriculum();
const lessons = flattenLessons();

function dataWith(overrides: Partial<LearningData>): LearningData {
  return { ...emptyData(), ...overrides };
}

function completed(...keys: string[]): LearningData {
  const lessonsState: LearningData['lessons'] = {};
  for (const key of keys) lessonsState[key] = { completedAt: '2026-08-01T00:00:00.000Z' };
  return dataWith({ lessons: lessonsState });
}

describe('progres', () => {
  it('nol persen saat belum ada yang selesai', () => {
    const progress = overallProgress(emptyData(), curriculum);
    expect(progress.done).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.total).toBe(lessons.length);
  });

  it('menghitung persentase per bab dengan benar', () => {
    const category = curriculum[0]!;
    const chapter = category.chapters[0]!;
    const firstTwo = chapter.lessons
      .slice(0, 2)
      .map((lesson) => `${category.slug}/${chapter.slug}/${lesson.slug}`);

    const progress = chapterProgress(completed(...firstTwo), category, chapter);
    expect(progress.done).toBe(2);
    expect(progress.total).toBe(chapter.lessons.length);
    expect(progress.percent).toBe(Math.round((2 / chapter.lessons.length) * 100));
  });

  it('100% saat seluruh sub-bab selesai', () => {
    const progress = overallProgress(
      completed(...lessons.map((location) => location.key)),
      curriculum,
    );
    expect(progress.percent).toBe(100);
  });

  it('mengabaikan kunci yang tidak ada di kurikulum', () => {
    const progress = overallProgress(completed('kategori-hantu/bab/sub'), curriculum);
    expect(progress.done).toBe(0);
  });
});

describe('resolveContinue', () => {
  it('menunjuk sub-bab pertama saat belum ada progres', () => {
    expect(resolveContinue(emptyData(), lessons)?.key).toBe(lessons[0]!.key);
  });

  it('menunjuk sub-bab terakhir yang dibuka bila belum selesai', () => {
    const target = lessons[5]!;
    const data = dataWith({ lastVisited: target.key });
    expect(resolveContinue(data, lessons)?.key).toBe(target.key);
  });

  it('melompat ke sub-bab belum selesai berikutnya bila yang terakhir dibuka sudah selesai', () => {
    const done = lessons[0]!;
    const data = { ...completed(done.key), lastVisited: done.key };
    expect(resolveContinue(data, lessons)?.key).toBe(lessons[1]!.key);
  });

  it('mengembalikan undefined saat semuanya selesai', () => {
    const data = completed(...lessons.map((location) => location.key));
    expect(resolveContinue(data, lessons)).toBeUndefined();
  });
});

describe('streak', () => {
  const today = new Date(2026, 7, 15); // 15 Agustus 2026, waktu lokal

  it('nol saat belum ada aktivitas', () => {
    expect(computeStreak({}, today)).toEqual({ current: 0, longest: 0 });
  });

  it('menghitung hari berturut-turut yang berakhir hari ini', () => {
    const activity = {
      '2026-08-13': 1,
      '2026-08-14': 2,
      '2026-08-15': 1,
    };
    expect(computeStreak(activity, today).current).toBe(3);
  });

  it('tidak menganggap streak putus bila hari ini belum ada aktivitas tapi kemarin ada', () => {
    const activity = { '2026-08-13': 1, '2026-08-14': 1 };
    expect(computeStreak(activity, today).current).toBe(2);
  });

  it('putus bila ada satu hari kalender penuh yang kosong', () => {
    const activity = { '2026-08-10': 1, '2026-08-11': 1, '2026-08-15': 1 };
    const streak = computeStreak(activity, today);
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(2);
  });

  it('mengabaikan hari dengan hitungan nol', () => {
    const activity = { '2026-08-14': 0, '2026-08-15': 1 };
    expect(computeStreak(activity, today).current).toBe(1);
  });

  it('menangani perpindahan bulan', () => {
    const awalBulan = new Date(2026, 8, 1); // 1 September 2026
    const activity = { '2026-08-31': 1, '2026-09-01': 1 };
    expect(computeStreak(activity, awalBulan).current).toBe(2);
  });

  it('memakai tanggal lokal, bukan UTC', () => {
    // 23:30 waktu lokal masih hari yang sama secara lokal, meski di UTC bisa sudah besok.
    const malam = new Date(2026, 7, 15, 23, 30);
    expect(toLocalDay(malam)).toBe('2026-08-15');
  });
});

describe('recentActivity', () => {
  it('selalu mengembalikan tepat 30 hari, terlama dulu', () => {
    const result = recentActivity({ '2026-08-15': 3 }, new Date(2026, 7, 15));
    expect(result).toHaveLength(30);
    expect(result[29]).toEqual({ day: '2026-08-15', count: 3 });
    expect(result[0]?.count).toBe(0);
  });
});

describe('scoreQuiz', () => {
  const questions = [
    { id: 'a', answerIndex: 1 },
    { id: 'b', answerIndex: 0 },
    { id: 'c', answerIndex: 2 },
  ];

  it('menghitung skor yang benar', () => {
    const result = scoreQuiz(questions, { a: 1, b: 0, c: 2 });
    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
  });

  it('menandai jawaban salah beserta jawaban benarnya', () => {
    const result = scoreQuiz(questions, { a: 0, b: 0, c: 2 });
    expect(result.score).toBe(2);
    expect(result.perQuestion[0]).toEqual({ id: 'a', chosen: 0, correct: 1, isCorrect: false });
  });

  it('soal yang tidak dijawab dihitung salah, bukan crash', () => {
    const result = scoreQuiz(questions, {});
    expect(result.score).toBe(0);
    expect(result.perQuestion.every((entry) => entry.chosen === -1)).toBe(true);
  });

  it('kuis kosong menghasilkan skor 0 dari 0 tanpa error', () => {
    expect(scoreQuiz([], {})).toEqual({ score: 0, total: 0, perQuestion: [] });
  });
});

describe('daftar tinjauan dan catatan', () => {
  it('mengumpulkan sub-bab bertanda perlu diulang', () => {
    const target = lessons[3]!;
    const data = dataWith({ lessons: { [target.key]: { needsReview: true } } });
    expect(collectReviewList(data, lessons).map((item) => item.key)).toEqual([target.key]);
  });

  it('mengabaikan catatan yang hanya berisi spasi', () => {
    const target = lessons[2]!;
    const data = dataWith({ lessons: { [target.key]: { note: '   \n  ' } } });
    expect(collectNotes(data, lessons)).toHaveLength(0);
  });

  it('mengumpulkan catatan beserta lokasinya', () => {
    const target = lessons[2]!;
    const data = dataWith({
      lessons: { [target.key]: { note: 'ingat ini', noteUpdatedAt: '2026-08-01T10:00:00.000Z' } },
    });
    const notes = collectNotes(data, lessons);
    expect(notes).toHaveLength(1);
    expect(notes[0]?.note).toBe('ingat ini');
    expect(notes[0]?.location.key).toBe(target.key);
  });
});

describe('findOrphanedKeys', () => {
  it('menemukan kunci yang sudah tidak ada di kurikulum', () => {
    const valid = new Set(lessons.map((location) => location.key));
    const data = completed(lessons[0]!.key, 'kategori-lama/bab-lama/sub-lama');
    expect(findOrphanedKeys(data, valid)).toEqual(['kategori-lama/bab-lama/sub-lama']);
  });

  it('tidak menemukan apa-apa saat semua kunci valid', () => {
    const valid = new Set(lessons.map((location) => location.key));
    expect(findOrphanedKeys(completed(lessons[0]!.key), valid)).toEqual([]);
  });
});
