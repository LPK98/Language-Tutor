import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArcGauge } from './ArcGauge';
import { Card } from './Card';

import { formatPractice, practiceMinutes, type DailyGoal } from '@/constants/profile';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type DailyGoalCardProps = {
  goal: DailyGoal;
  onAdjustGoal?: () => void;
};

/** Today's practice against the daily goal, plus the two summary stats. */
export function DailyGoalCard({ goal, onAdjustGoal }: DailyGoalCardProps) {
  const minutes = practiceMinutes(goal.practisedSeconds);
  const progress = goal.goalMinutes > 0 ? minutes / goal.goalMinutes : 0;

  return (
    <Card style={styles.card}>
      <ArcGauge progress={progress}>
        <Text style={styles.time}>{formatPractice(goal.practisedSeconds)}</Text>
        <Text style={styles.caption}>Today&rsquo;s Practice of</Text>
        <Text style={styles.caption}>your {goal.goalMinutes}-minute goal</Text>
      </ArcGauge>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adjust daily goal"
        onPress={onAdjustGoal}
        style={({ pressed }) => [styles.adjustButton, pressed && styles.pressed]}>
        <Text style={styles.adjustLabel}>Adjust Goal</Text>
      </Pressable>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{goal.completedLessons}</Text>
          <Text style={styles.statLabel}>Completed Lessons</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>{minutes}</Text>
          <Text style={styles.statLabel}>Practice Time &middot; mins</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  time: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: Colors.display,
    letterSpacing: -1,
  },
  caption: {
    fontSize: FontSize.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  adjustButton: {
    marginTop: Spacing.sm,
    height: 44,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  adjustLabel: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: Spacing.xxl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 56,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.display,
  },
  statLabel: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
