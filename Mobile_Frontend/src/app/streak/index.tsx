import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StreakBadge } from '@/components/StreakBadge';
import { StreakCalendar } from '@/components/StreakCalendar';
import { PROFILE, bestStreak, currentStreak } from '@/constants/profile';
import { Colors, FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/constants/theme';

const plural = (value: number, noun: string) => `${value} ${noun}${value === 1 ? '' : 's'}`;

export default function StreakScreen() {
  const today = new Date();
  const { practisedDates } = PROFILE.streak;

  const current = currentStreak(practisedDates, today);
  const best = bestStreak(practisedDates);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.closeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => router.canGoBack() && router.back()}
          style={({ pressed }) => [styles.closeButton, Shadow.card, pressed && styles.pressed]}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.hero}>
          <StreakBadge days={current} />
          <Text style={styles.title}>Day streak</Text>
          <Text style={styles.subtitle}>Nice work.</Text>
          <Text style={styles.subtitle}>Your longest streak is {plural(best, 'day')}.</Text>
        </View>

        <StreakCalendar practisedDates={practisedDates} today={today} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.maxContentWidth,
  },
  hero: {
    alignItems: 'center',
  },
  title: {
    marginTop: Spacing.lg,
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.bodyLarge,
    color: Colors.text,
    textAlign: 'center',
  },
});
