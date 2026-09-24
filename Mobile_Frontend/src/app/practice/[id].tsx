import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollectionCard } from '@/components/CollectionCard';
import { PracticeProgressCard, type ProgressLegendItem } from '@/components/PracticeProgressCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl, type Segment } from '@/components/SegmentedControl';
import { SpeechRow } from '@/components/SpeechRow';
import { TermRow } from '@/components/TermRow';
import {
  countByStatus,
  getPracticeSet,
  practisedCount,
  type SpeechSet,
  type Term,
  type TermStatus,
  type TermsSet,
} from '@/constants/vocabulary';
import { Colors, FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/constants/theme';

type Filter = 'all' | TermStatus;

const SEGMENTS: Segment<Filter>[] = [
  { value: 'all', label: 'All' },
  { value: 'still-learning', label: 'Still Learning' },
  { value: 'known', label: 'Known' },
  { value: 'my-list', label: 'My List' },
];

const matchesFilter = (term: Term, filter: Filter): boolean =>
  filter === 'all' || term.status === filter;

/** Expandable glossary: progress summary, status filter, term list. */
function TermsBody({ set }: { set: TermsSet }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const legend: ProgressLegendItem[] = useMemo(
    () => [
      {
        id: 'still-learning',
        label: 'Still Learning',
        count: countByStatus(set.terms, 'still-learning'),
        color: Colors.primary,
      },
      {
        id: 'known',
        label: 'Known',
        count: countByStatus(set.terms, 'known'),
        color: Colors.pronunciation,
      },
      {
        id: 'my-list',
        label: 'My List',
        count: countByStatus(set.terms, 'my-list'),
        color: Colors.lesson,
      },
    ],
    [set.terms],
  );

  const visibleTerms = useMemo(
    () => set.terms.filter((term) => matchesFilter(term, filter)),
    [set.terms, filter],
  );

  return (
    <>
      <PracticeProgressCard
        practised={practisedCount(set.terms)}
        total={set.terms.length}
        unitLabel={set.unitLabel}
        legend={legend}
      />

      <SegmentedControl segments={SEGMENTS} value={filter} onChange={setFilter} />

      <View style={styles.list}>
        {visibleTerms.length > 0 ? (
          visibleTerms.map((term) => (
            <TermRow
              key={term.id}
              term={term}
              expanded={expandedId === term.id}
              onToggle={() => setExpandedId((current) => (current === term.id ? null : term.id))}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>Nothing here yet &mdash; keep practising.</Text>
        )}
      </View>
    </>
  );
}

/** Listen-and-repeat: collection card above a list of words. */
function SpeechBody({ set }: { set: SpeechSet }) {
  return (
    <>
      <CollectionCard collection={set.collection} wordCount={set.words.length} />

      <View style={styles.list}>
        {set.words.map((word) => (
          <SpeechRow key={word.id} word={word} />
        ))}
      </View>
    </>
  );
}

export default function PracticeSetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const set = getPracticeSet(id);

  if (!set) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title="Practice" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>That practice set isn&rsquo;t available yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title={set.title} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        {set.kind === 'terms' ? <TermsBody set={set} /> : <SpeechBody set={set} />}
      </ScrollView>

      <View pointerEvents="box-none" style={styles.recapLayer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Recap all ${set.title}`}
          onPress={() => {}}
          style={({ pressed }) => [styles.recapButton, Shadow.floating, pressed && styles.pressed]}>
          <Ionicons name="shuffle" size={20} color={Colors.white} />
          <Text style={styles.recapLabel}>Recap All</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    /** Clears the floating Recap button. */
    paddingBottom: 110,
    gap: Spacing.xl,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.maxContentWidth,
  },
  list: {
    gap: Spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.screenPadding,
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  recapLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  recapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
  recapLabel: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
});
