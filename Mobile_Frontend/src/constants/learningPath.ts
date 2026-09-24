import type { ImageSourcePropType } from 'react-native';

/**
 * Learning path content. Rows are explicit so the zig-zag and its curved
 * connectors stay readable; swap this array for API data later.
 */

export type PathNode = {
  id: string;
  title: string;
  /** Emoji stand-in until illustrated node art is supplied. */
  emoji: string;
  image: ImageSourcePropType | null;
  /** Pastel circle fill. */
  color: string;
  completed?: boolean;
};

/** How a row links down to the row beneath it. */
export type RowConnector = 'corner-right' | 'arc-left' | 'arc-right' | null;

export type PathRow = {
  nodes: PathNode[];
  connector: RowConnector;
  /** Draws the scroll-down affordance on the connector. */
  marker?: boolean;
};

export type LearningPath = {
  level: string;
  rows: PathRow[];
};

export const BEGINNER_PATH: LearningPath = {
  level: 'Beginner',
  rows: [
    {
      nodes: [
        {
          id: 'hello',
          title: 'Hello!',
          emoji: '\u{1F44B}',
          image: null,
          color: '#DCEAFB',
        },
      ],
      connector: 'corner-right',
    },
    {
      nodes: [
        {
          id: 'magic-words',
          title: 'Magic Words',
          emoji: '⭐',
          image: null,
          color: '#FBE6A2',
        },
        {
          id: 'who-am-i',
          title: 'Who Am I?',
          emoji: '\u{1F4DB}',
          image: null,
          color: '#FBDDE0',
        },
      ],
      connector: 'arc-left',
    },
    {
      nodes: [
        {
          id: 'this-is-my',
          title: 'This is My...',
          emoji: '\u{1F5BC}️',
          image: null,
          color: '#FBE3D0',
        },
        {
          id: 'how-are-you',
          title: 'How Are You?',
          emoji: '\u{1F4AC}',
          image: null,
          color: '#FBD9A8',
        },
      ],
      connector: 'arc-right',
      marker: true,
    },
    {
      nodes: [
        {
          id: 'my-day',
          title: 'My Day',
          emoji: '\u{1F31E}',
          image: null,
          color: '#FBDDE0',
        },
        {
          id: 'i-like',
          title: 'I Like...',
          emoji: '❤️',
          image: null,
          color: '#DCEAFB',
        },
      ],
      connector: null,
    },
  ],
};
