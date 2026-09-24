import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MONTH_LABELS, WEEKDAY_LABELS, toISODate } from '@/constants/profile';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type StreakCalendarProps = {
  practisedDates: string[];
  /** Injectable for testing; defaults to the real today. */
  today?: Date;
};

type Cell = { key: string; day: number | null; iso?: string };

/** Month grid with leading blanks so the 1st lands under its weekday. */
function buildMonth(year: number, month: number): Cell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks: Cell[] = Array.from({ length: firstWeekday }, (_, index) => ({
    key: `blank-${index}`,
    day: null,
  }));

  const days: Cell[] = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return { key: `day-${day}`, day, iso: toISODate(new Date(year, month, day)) };
  });

  return [...blanks, ...days];
}

export function StreakCalendar({ practisedDates, today = new Date() }: StreakCalendarProps) {
  const [visible, setVisible] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const practised = useMemo(() => new Set(practisedDates), [practisedDates]);
  const cells = useMemo(() => buildMonth(visible.year, visible.month), [visible]);
  const todayIso = toISODate(today);

  const shiftMonth = (delta: number) =>
    setVisible((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  return (
    <View>
      <View style={styles.monthRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => shiftMonth(-1)}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.monthLabel}>
          {MONTH_LABELS[visible.month]} {visible.year}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => shiftMonth(1)}
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}>
          <Ionicons name="chevron-forward" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.cell}>
            <Text style={styles.weekdayLabel}>{label}</Text>
          </View>
        ))}

        {cells.map((cell) => {
          if (cell.day === null) {
            return <View key={cell.key} style={styles.cell} />;
          }

          const isPractised = practised.has(cell.iso as string);
          const isToday = cell.iso === todayIso;

          return (
            <View key={cell.key} style={styles.cell}>
              <View
                accessibilityLabel={isPractised ? `${cell.day}, practised` : `${cell.day}`}
                style={[
                  styles.dayCircle,
                  isPractised && styles.dayPractised,
                  isToday && !isPractised && styles.dayToday,
                ]}>
                <Text style={[styles.dayLabel, isPractised && styles.dayLabelPractised]}>
                  {cell.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const CIRCLE = 40;

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  pressed: {
    opacity: 0.5,
  },
  monthLabel: {
    fontSize: FontSize.bodyLarge + 2,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    /** Seven equal columns. */
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: Spacing.xs + 1,
  },
  weekdayLabel: {
    height: 28,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  dayCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPractised: {
    backgroundColor: Colors.lesson,
  },
  dayToday: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.lesson,
  },
  dayLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  dayLabelPractised: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
});
