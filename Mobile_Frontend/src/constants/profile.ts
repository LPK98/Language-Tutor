import type { ImageSourcePropType } from 'react-native';

import { EMMA, type Tutor } from './lessons';

export type DailyGoal = {
  /** Target practice time per day, in minutes. */
  goalMinutes: number;
  /** Time practised today, in seconds. */
  practisedSeconds: number;
  completedLessons: number;
};

export type Streak = {
  /** ISO `yyyy-mm-dd` days the learner practised. Single source of truth:
   *  the current streak, the best streak and the week dots all derive from it. */
  practisedDates: string[];
};

/** Static profile content for the UI prototype. */
export type Profile = {
  name: string;
  avatar: ImageSourcePropType | null;
  tutor: Tutor;
  language: {
    label: string;
    /** Flag emoji fallback until a flag asset is supplied. */
    flag: string;
    image: ImageSourcePropType | null;
  };
  level: string;
  interest: {
    title: string;
    subtitle: string;
    emoji: string;
    image: ImageSourcePropType | null;
  };
  dailyGoal: DailyGoal;
  streak: Streak;
};

export const PROFILE: Profile = {
  name: 'Student',
  avatar: null,
  tutor: EMMA,
  language: {
    label: 'English (UK)',
    flag: '\u{1F1EC}\u{1F1E7}',
    image: null,
  },
  level: 'B1',
  interest: {
    title: 'Choose an interest',
    subtitle: 'Start conversations around your interests.',
    emoji: '\u{1F9F3}',
    image: null,
  },
  dailyGoal: {
    goalMinutes: 60,
    practisedSeconds: 0,
    completedLessons: 0,
  },
  streak: {
    practisedDates: ['2026-09-16'],
  },
};

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Local-time `yyyy-mm-dd`; avoids the UTC shift of `toISOString`. */
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/**
 * Consecutive practised days ending today, or ending yesterday when today has
 * not been practised yet, so an unfinished day does not reset the count.
 */
export const currentStreak = (practisedDates: string[], today: Date): number => {
  const practised = new Set(practisedDates);
  let cursor = practised.has(toISODate(today)) ? today : addDays(today, -1);
  if (!practised.has(toISODate(cursor))) {
    return 0;
  }

  let count = 0;
  while (practised.has(toISODate(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
};

/** Longest run of consecutive practised days on record. */
export const bestStreak = (practisedDates: string[]): number => {
  const sorted = [...new Set(practisedDates)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const iso of sorted) {
    const [year, month, day] = iso.split('-').map(Number);
    const expected = toISODate(new Date(year, month - 1, day - 1));
    run = previous === expected ? run + 1 : 1;
    previous = iso;
    if (run > best) {
      best = run;
    }
  }
  return best;
};

/** Weekday indexes practised in the Sunday-to-Saturday week containing `today`. */
export const practisedWeekdays = (practisedDates: string[], today: Date): number[] => {
  const practised = new Set(practisedDates);
  const sunday = addDays(today, -today.getDay());

  return WEEKDAY_LABELS.map((_, index) => index).filter((index) =>
    practised.has(toISODate(addDays(sunday, index))),
  );
};

/** Formats practice time as m:ss for the goal gauge. */
export const formatPractice = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};

export const practiceMinutes = (seconds: number): number => Math.floor(Math.max(0, seconds) / 60);

/** First letter shown in the avatar when no photo is set. */
export const profileInitial = (name: string): string => name.trim().charAt(0).toUpperCase();
