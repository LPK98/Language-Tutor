import type { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';

import type { CategoryKey } from './theme';

/** Static practice content for the UI prototype. */

export type RecommendedItem = {
  id: string;
  title: string;
  category: CategoryKey;
  /** Emoji stand-in until 3D illustrations are supplied. */
  emoji: string;
  image: ImageSourcePropType | null;
};

export type PracticeCategory = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type PracticeTopic = {
  id: string;
  title: string;
  /** Estimated length in minutes. */
  minutes: number;
  image: ImageSourcePropType | null;
};

export type PracticeSection = {
  id: string;
  title: string;
  topics: PracticeTopic[];
};

export const RECOMMENDED: RecommendedItem[] = [
  { id: 'grammar', title: 'Grammar', category: 'grammar', emoji: '\u{1F4DA}', image: null },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    category: 'pronunciation',
    emoji: '\u{1F3A4}',
    image: null,
  },
  { id: 'vocab', title: 'Vocab', category: 'vocabulary', emoji: '\u{1F4D4}', image: null },
];

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  { id: 'travel', label: 'Travel & Transportation', icon: 'airplane-outline' },
  { id: 'work', label: 'Work & Career', icon: 'briefcase-outline' },
  { id: 'social', label: 'Social & Friends', icon: 'people-outline' },
  { id: 'dining', label: 'Dining & Food', icon: 'restaurant-outline' },
  { id: 'health', label: 'Health & Emergencies', icon: 'medkit-outline' },
  { id: 'shopping', label: 'Shopping & Errands', icon: 'cart-outline' },
];

export const PRACTICE_SECTIONS: PracticeSection[] = [
  {
    id: 'travel',
    title: 'Travel & Transportation',
    topics: [
      { id: 'airport', title: 'Airport check-in & security', minutes: 5, image: null },
      { id: 'taxi', title: 'Booking a taxi / rideshare', minutes: 6, image: null },
      { id: 'directions', title: 'Asking for directions', minutes: 5, image: null },
      { id: 'hotel', title: 'Checking into a hotel', minutes: 7, image: null },
    ],
  },
  {
    id: 'dining',
    title: 'Dining & Food',
    topics: [
      { id: 'restaurant', title: 'Ordering at a restaurant', minutes: 6, image: null },
      { id: 'cafe', title: 'Coffee shop small talk', minutes: 4, image: null },
      { id: 'bill', title: 'Splitting the bill', minutes: 5, image: null },
    ],
  },
  {
    id: 'work',
    title: 'Work & Career',
    topics: [
      { id: 'interview', title: 'Job interview basics', minutes: 8, image: null },
      { id: 'standup', title: 'Daily stand-up update', minutes: 4, image: null },
      { id: 'email', title: 'Writing a follow-up email', minutes: 6, image: null },
    ],
  },
];
