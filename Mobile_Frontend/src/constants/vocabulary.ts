import type { ImageSourcePropType } from 'react-native';

/**
 * Practice-set content backing the `/practice/[id]` detail screen.
 * Sets are a discriminated union because the layouts genuinely differ:
 * `terms` is an expandable glossary, `speech` is a listen-and-repeat list.
 */

export type TermStatus = 'still-learning' | 'known' | 'my-list';

export type Term = {
  id: string;
  term: string;
  definition: string;
  example: string;
  /** Undefined means the learner has not classified it yet. */
  status?: TermStatus;
};

export type TermsSet = {
  kind: 'terms';
  id: string;
  title: string;
  /** Noun shown under the practised count, e.g. "Practiced Vocabulary". */
  unitLabel: string;
  terms: Term[];
};

export type SpeechWord = {
  id: string;
  word: string;
};

/** The collection card sitting above the word list. */
export type SpeechCollection = {
  title: string;
  subtitle: string;
  /** Emoji stand-in until collection artwork is supplied. */
  emoji: string;
  image: ImageSourcePropType | null;
};

export type SpeechSet = {
  kind: 'speech';
  id: string;
  title: string;
  collection: SpeechCollection;
  words: SpeechWord[];
};

export type PracticeSet = TermsSet | SpeechSet;

const speechWords = (words: string[]): SpeechWord[] =>
  words.map((word) => ({ id: word.toLowerCase().replace(/[^a-z0-9]+/g, '-'), word }));

export const PRACTICE_SETS: Record<string, PracticeSet> = {
  vocab: {
    kind: 'terms',
    id: 'vocab',
    title: 'Vocab',
    unitLabel: 'Practiced Vocabulary',
    terms: [
      {
        id: 'processed',
        term: 'Processed',
        definition: 'Treated or prepared by a series of steps before being sold.',
        example: 'The beans are processed before they reach the shop.',
      },
      {
        id: 'packaged',
        term: 'Packaged',
        definition: 'Wrapped or boxed ready for sale or transport.',
        example: 'Everything is packaged by hand at the factory.',
      },
      {
        id: 'exported',
        term: 'Exported',
        definition: 'Sent to another country to be sold.',
        example: 'Most of the crop is exported to Europe.',
      },
      {
        id: 'assembly-line',
        term: 'Assembly line',
        definition: 'A line of workers and machines that build a product step by step.',
        example: 'She works on the assembly line at the car plant.',
      },
      {
        id: 'material',
        term: 'Material',
        definition: 'The substance something is made from.',
        example: 'This jacket is made from recycled material.',
      },
      {
        id: 'product',
        term: 'Product',
        definition: 'Something made or grown to be sold.',
        example: 'Their newest product launches in spring.',
      },
      {
        id: 'will-be-flying',
        term: 'Will be flying',
        definition: 'Future continuous: an action in progress at a future time.',
        example: 'This time tomorrow I will be flying to Madrid.',
      },
      {
        id: 'will-be-sleeping',
        term: 'Will be sleeping',
        definition: 'Future continuous: an action in progress at a future time.',
        example: 'Call later — the kids will be sleeping by then.',
      },
    ],
  },
  grammar: {
    kind: 'terms',
    id: 'grammar',
    title: 'Grammar',
    unitLabel: 'Practiced Grammar',
    terms: [
      {
        id: 'must',
        term: 'Must',
        definition: 'Used when you are almost certain something is true.',
        example: "You've been travelling all day — you must be tired.",
      },
      {
        id: 'might',
        term: 'Might',
        definition: 'Used when something is possible but not certain.',
        example: 'She might be at the office already.',
      },
      {
        id: 'cant',
        term: "Can't",
        definition: 'Used when you are almost certain something is not true.',
        example: "That can't be his brother — he's an only child.",
      },
    ],
  },
  pronunciation: {
    kind: 'speech',
    id: 'pronunciation',
    title: 'Pronunciation',
    collection: {
      title: 'Lesson Vocabulary',
      subtitle: 'All lesson words',
      emoji: '\u{1F30D}',
      image: null,
    },
    words: speechWords([
      'Hello',
      'Hi',
      'Good morning',
      'Bye',
      'See you',
      'Nice',
      'Nice to meet you',
      'Good afternoon',
      'Good evening',
      'Good night',
      'Please',
      'Thank you',
      'Sorry',
      'Excuse me',
      'Yes',
      'No',
      'How are you?',
      'Goodbye',
    ]),
  },
};

export const getPracticeSet = (id?: string): PracticeSet | undefined =>
  id ? PRACTICE_SETS[id] : undefined;

export const countByStatus = (terms: Term[], status: TermStatus): number =>
  terms.filter((term) => term.status === status).length;

/** Anything the learner has classified counts as practised. */
export const practisedCount = (terms: Term[]): number =>
  terms.filter((term) => term.status !== undefined).length;
