import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImagePlaceholder } from './ImagePlaceholder';

import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

export const HERO_HEIGHT = 280;

type TutorHeroProps = {
  tutorName: string;
  image: ImageSourcePropType | null;
  /** Unopened rewards; hides the badge when zero. */
  giftCount?: number;
  streak?: number;
  onPressGift?: () => void;
  onPressStreak?: () => void;
  onPressTutors?: () => void;
};

/** Full-bleed tutor photo with translucent controls floating over it. */
export function TutorHero({
  tutorName,
  image,
  giftCount = 0,
  streak = 0,
  onPressGift,
  onPressStreak,
  onPressTutors,
}: TutorHeroProps) {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + Spacing.sm;

  return (
    <View style={styles.hero}>
      <ImagePlaceholder
        source={image}
        icon="person"
        label={tutorName}
        tint={Colors.textSecondary}
        style={styles.image}
        accessibilityLabel={`${tutorName}, your tutor`}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          giftCount > 0 ? `Rewards, ${giftCount} available` : 'Rewards'
        }
        onPress={onPressGift}
        style={({ pressed }) => [styles.giftButton, { top: topOffset }, pressed && styles.pressed]}>
        <Text style={styles.giftEmoji}>{'\u{1F381}'}</Text>
        {giftCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{giftCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Streak, ${streak} days`}
        onPress={onPressStreak}
        style={({ pressed }) => [styles.streakPill, { top: topOffset }, pressed && styles.pressed]}>
        <Text style={styles.streakCount}>{streak}</Text>
        <Text style={styles.streakEmoji}>{'\u{1F525}'}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch tutor"
        onPress={onPressTutors}
        style={({ pressed }) => [styles.tutorsPill, pressed && styles.pressed]}>
        <Text style={styles.tutorsLabel}>Tutors</Text>
        <Ionicons name="sync" size={15} color={Colors.text} />
      </Pressable>
    </View>
  );
}

const SCRIM = 'rgba(240, 240, 242, 0.82)';

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: Colors.neutral,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.75,
  },
  giftButton: {
    position: 'absolute',
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    backgroundColor: '#E5352B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  streakPill: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: SCRIM,
  },
  streakCount: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  streakEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  tutorsPill: {
    position: 'absolute',
    left: Spacing.lg,
    bottom: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: SCRIM,
  },
  tutorsLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
});
