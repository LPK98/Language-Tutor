import type { ImageSourcePropType } from 'react-native';

/**
 * Learning path content. Each level is a zig-zag of lesson nodes; the curved
 * connectors between rows are derived from position rather than authored, so
 * adding a level only means listing its nodes.
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
  id: string;
  level: string;
  rows: PathRow[];
};

/** Pastel fills cycled across a level's nodes. */
const NODE_COLORS = [
  '#DCEAFB',
  '#FBE6A2',
  '#FBDDE0',
  '#FBE3D0',
  '#FBD9A8',
  '#DFF5E3',
  '#E8E2FB',
];

type NodeSpec = [title: string, emoji: string];

const toNode = (spec: NodeSpec, index: number): PathNode => {
  const [title, emoji] = spec;
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title,
    emoji,
    image: null,
    color: NODE_COLORS[index % NODE_COLORS.length],
  };
};

/**
 * Lays specs out as one centred node followed by pairs, and picks each row's
 * connector so the path snakes: right off the intro node, then alternating
 * left and right arcs down the sides.
 */
function buildLevel(id: string, level: string, specs: NodeSpec[], hasMore: boolean): LearningPath {
  const nodes = specs.map(toNode);
  const groups: PathNode[][] = [[nodes[0]]];

  for (let index = 1; index < nodes.length; index += 2) {
    groups.push(nodes.slice(index, index + 2));
  }

  const rows: PathRow[] = groups.map((rowNodes, index) => {
    const isLast = index === groups.length - 1;
    let connector: RowConnector = null;

    if (!isLast) {
      connector = index === 0 ? 'corner-right' : index % 2 === 1 ? 'arc-left' : 'arc-right';
    }

    return {
      nodes: rowNodes,
      connector,
      /** Hint that the next level sits below. */
      marker: hasMore && index === groups.length - 2,
    };
  });

  return { id, level, rows };
}

export const BEGINNER_PATH = buildLevel(
  'beginner',
  'Beginner',
  [
    ['Hello!', '\u{1F44B}'],
    ['Magic Words', '⭐'],
    ['Who Am I?', '\u{1F4DB}'],
    ['This is My...', '\u{1F5BC}️'],
    ['How Are You?', '\u{1F4AC}'],
    ['My Day', '\u{1F31E}'],
    ['I Like...', '❤️'],
  ],
  true,
);

export const INTERMEDIATE_PATH = buildLevel(
  'intermediate',
  'Intermediate',
  [
    ['Small Talk', '\u{1F5E3}️'],
    ['At the Shops', '\u{1F6CD}️'],
    ['Making Plans', '\u{1F4C5}'],
    ['On the Phone', '\u{1F4DE}'],
    ['Directions', '\u{1F9ED}'],
    ['Eating Out', '\u{1F37D}️'],
    ['My Weekend', '\u{1F392}'],
  ],
  true,
);

export const EXPERT_PATH = buildLevel(
  'expert',
  'Expert',
  [
    ['Job Interview', '\u{1F4BC}'],
    ['Giving Opinions', '\u{1F4AD}'],
    ['Idioms', '\u{1F3AF}'],
    ['Negotiating', '\u{1F91D}'],
    ['Presenting', '\u{1F4CA}'],
    ['Debating', '⚖️'],
    ['Storytelling', '\u{1F4D6}'],
  ],
  false,
);

export const LEARNING_PATHS: LearningPath[] = [BEGINNER_PATH, INTERMEDIATE_PATH, EXPERT_PATH];
