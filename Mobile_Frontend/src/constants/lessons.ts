import type { ImageSourcePropType } from 'react-native';

import { CategoryColors, type CategoryKey } from './theme';

/**
 * Static content for the UI prototype. The shapes below are intentionally
 * API-friendly: swapping these arrays for fetched data should not require
 * touching any screen.
 */

export type Lesson = {
  id: string;
  title: string;
  category: CategoryKey;
  categoryLabel: string;
  description: string;
  /** Local illustration. `null` renders a styled placeholder. */
  image: ImageSourcePropType | null;
};

export type Tutor = {
  id: string;
  name: string;
  avatar: ImageSourcePropType | null;
};

export const EMMA: Tutor = {
  id: 'emma',
  name: 'Emma',
  avatar: null,
};

export const LESSONS: Lesson[] = [
  {
    id: 'modals-deduction',
    title: 'Modals of Deduction',
    category: 'grammar',
    categoryLabel: 'Grammar',
    description: 'Must, might, can’t — talk about how sure you are.',
    image: require('@/assets/images/Grammer.png'),
  },
  {
    id: 'ordering-food',
    title: 'Ordering at a Cafe',
    category: 'lesson',
    categoryLabel: 'Lesson',
    description: 'Order a drink and ask for the bill with confidence.',
    image: require('@/assets/images/lesson.png'),
  },
  {
    id: 'th-sounds',
    title: 'The /θ/ and /ð/ Sounds',
    category: 'pronunciation',
    categoryLabel: 'Pronunciation',
    description: 'Hear the difference between think and this.',
    image: require('@/assets/images/Pronounce.png'),
  },
];

export const categoryColor = (category: CategoryKey): string => CategoryColors[category];
