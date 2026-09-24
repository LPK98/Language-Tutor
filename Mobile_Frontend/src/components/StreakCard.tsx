import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';

import {
  WEEKDAY_LABELS,
  bestStreak,
  currentStreak,
  practisedWeekdays,
  type Streak,
} from '@/constants/profile';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type StreakCardProps = {
  streak: Streak;
  /** Injectable so the highlighted day is testable; defaults to today. */
  todayIndex?: number;
  onPress?: () => void;
};

function StreakTotal({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.total}>
      <Text style={styles.totalLabel}>{label}</Text>
      <View style={styles.totalRow}>
        <Text style={styles.flame}>{'\u{1F525}'}</Text>
        <Text style={styles.totalValue}>
          {value} {value === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </View>
  );
}

export function StreakCard({ streak, todayIndex, onPress }: StreakCardProps) {
  const now = new Date();
  const today = todayIndex ?? now.getDay();
  const completed = practisedWeekdays(streak.practisedDates, now);

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Streak details"
        onPress={onPress}
        style={({ pressed }) => [styles.titleRow, pressed && styles.pressed]}>
        <Text style={styles.title}>Streak</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.text} />
      </Pressable>

      <View style={styles.week}>
        {WEEKDAY_LABELS.map((label, index) => {
          const isToday = index === today;
          const isCompleted = completed.includes(index);

          return (
            <View key={label} style={styles.day}>
              <View
                style={[
                  styles.dayCircle,
                  isCompleted && styles.dayCircleCompleted,
                  isToday && styles.dayCircleToday,
                ]}>
                {isCompleted ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : null}
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.totals}>
        <StreakTotal label="CURRENT STREAK" value={currentStreak(streak.practisedDates, now)} />
        <StreakTotal label="BEST STREAK" value={bestStreak(streak.practisedDates)} />
      </View>
    </Card>
  );
}

const CIRCLE = 36;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  day: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: Colors.lesson,
  },
  dayCircleToday: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.lesson,
  },
  dayLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  dayLabelToday: {
    color: Colors.lesson,
    fontWeight: FontWeight.semibold,
  },
  totals: {
    flexDirection: 'row',
    marginTop: Spacing.xxl,
  },
  total: {
    flex: 1,
    gap: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flame: {
    fontSize: 18,
    lineHeight: 22,
  },
  totalValue: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
