import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';

import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

export type ProgressLegendItem = {
  id: string;
  label: string;
  count: number;
  color: string;
};

type PracticeProgressCardProps = {
  practised: number;
  total: number;
  unitLabel: string;
  legend: ProgressLegendItem[];
  onPressInfo?: () => void;
};

/** Headline count, completion bar and the status legend. */
export function PracticeProgressCard({
  practised,
  total,
  unitLabel,
  legend,
  onPressInfo,
}: PracticeProgressCardProps) {
  const ratio = total > 0 ? Math.min(practised / total, 1) : 0;

  return (
    <Card>
      <Text style={styles.count}>{practised}</Text>

      <View style={styles.unitRow}>
        <Text style={styles.unitLabel}>{unitLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`About ${unitLabel}`}
          onPress={onPressInfo}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <Ionicons name="information-circle" size={16} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: practised }}
        style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>

      <View style={styles.legend}>
        {legend.map((item, index) => (
          <View key={item.id} style={styles.legendItem}>
            {index > 0 ? <View style={styles.legendDivider} /> : null}
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {item.label} ({item.count})
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 44,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    lineHeight: 52,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  unitLabel: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
  track: {
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    marginTop: Spacing.xl,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  legendItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  legendDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
    marginRight: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  legendLabel: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flexShrink: 1,
  },
});
