import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';

import type { Lesson } from '@/constants/lessons';
import {
  CategoryColors,
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';

type LessonCardProps = {
  lesson: Lesson;
  onStart?: () => void;
};

const TIMELINE_DOTS = 4;

/** Vertical dotted rail between the two timeline nodes. */
function DottedRail({ color }: { color: string }) {
  return (
    <View style={styles.rail}>
      {Array.from({ length: TIMELINE_DOTS }, (_, index) => (
        <View key={index} style={[styles.railDot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

export function LessonCard({ lesson, onStart }: LessonCardProps) {
  const accent = CategoryColors[lesson.category];

  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={styles.timeline}>
        <View style={styles.rowStart}>
          <View style={[styles.node, { backgroundColor: accent }]} />
          <View style={styles.nodeBody}>
            <Text style={styles.title}>{lesson.title}</Text>
            <View style={[styles.tag, { backgroundColor: `${accent}1A` }]}>
              <Text style={[styles.tagLabel, { color: accent }]}>{lesson.categoryLabel}</Text>
            </View>
          </View>
        </View>

        <DottedRail color={`${accent}59`} />

        <View style={styles.rowStart}>
          <View style={[styles.node, styles.nodeHollow, { borderColor: accent }]} />
          <View style={styles.nodeBody}>
            <Text style={styles.description}>{lesson.description}</Text>
          </View>
        </View>
      </View>

      <PrimaryButton label="Start" color={accent} onPress={onStart} style={styles.cta} />
    </View>
  );
}

const NODE_SIZE = 14;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  timeline: {
    gap: Spacing.sm,
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  nodeHollow: {
    backgroundColor: Colors.background,
    borderWidth: 2,
  },
  nodeBody: {
    flex: 1,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  tagLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
  },
  description: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  rail: {
    marginLeft: (NODE_SIZE - 3) / 2,
    gap: Spacing.xs + 1,
    paddingVertical: Spacing.xs,
  },
  railDot: {
    width: 3,
    height: 3,
    borderRadius: Radius.pill,
  },
  cta: {
    alignSelf: 'stretch',
  },
});
