import type { ImageSourcePropType } from 'react-native';

import { EMMA, type Tutor } from './lessons';

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
};

/** First letter shown in the avatar when no photo is set. */
export const profileInitial = (name: string): string => name.trim().charAt(0).toUpperCase();
