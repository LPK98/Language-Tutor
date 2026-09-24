import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BOTTOM_NAV_CLEARANCE } from '@/components/BottomNavigation';
import { CategoryCard } from '@/components/CategoryCard';
import { PracticeCard } from '@/components/PracticeCard';
import { SectionHeader } from '@/components/SectionHeader';
import { TopicCard } from '@/components/TopicCard';
import {
  PRACTICE_CATEGORIES,
  PRACTICE_SECTIONS,
  RECOMMENDED,
  type PracticeSection,
} from '@/constants/practice';
import { Colors, FontSize, FontWeight, Layout, Spacing } from '@/constants/theme';

/** Splits the chips into the two rows that scroll together. */
function categoryRows() {
  const half = Math.ceil(PRACTICE_CATEGORIES.length / 2);
  return [PRACTICE_CATEGORIES.slice(0, half), PRACTICE_CATEGORIES.slice(half)];
}

function TopicRail({ section }: { section: PracticeSection }) {
  return (
    <View>
      <SectionHeader title={section.title} onPress={() => {}} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}>
        {section.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onPress={() => {}} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function PracticeScreen() {
  const router = useRouter();
  const rows = categoryRows();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <Text style={styles.pageTitle}>Practice</Text>

        <View>
          <SectionHeader title="Recommended for you" size="md" />
          <View style={styles.recommendedRow}>
            {RECOMMENDED.map((item) => (
              <PracticeCard
                key={item.id}
                item={item}
                onPress={() => router.push({ pathname: '/practice/[id]', params: { id: item.id } })}
              />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Categories" onPress={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryGrid}>
            {rows.map((row, index) => (
              <View key={index} style={styles.categoryRow}>
                {row.map((category) => (
                  <CategoryCard key={category.id} category={category} onPress={() => {}} />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {PRACTICE_SECTIONS.map((section) => (
          <TopicRail key={section.id} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: BOTTOM_NAV_CLEARANCE,
    gap: Spacing.xxxl,
  },
  pageTitle: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    fontSize: FontSize.pageTitle,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  recommendedRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
  },
  /** Two chip rows stacked inside one horizontal scroller. */
  categoryGrid: {
    flexDirection: 'column',
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rail: {
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
  },
});
