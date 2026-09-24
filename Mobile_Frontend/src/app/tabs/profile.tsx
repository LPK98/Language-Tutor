import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BOTTOM_NAV_CLEARANCE } from '@/components/BottomNavigation';
import { Card } from '@/components/Card';
import { DailyGoalCard } from '@/components/DailyGoalCard';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProfileHeader } from '@/components/ProfileHeader';
import { StreakCard } from '@/components/StreakCard';
import { PROFILE } from '@/constants/profile';
import { Colors, FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/constants/theme';

/** Row label with a trailing chevron, shared by the small cards. */
function CardLabel({ text }: { text: string }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.labelText}>{text}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.text} />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { name, avatar, tutor, language, level, interest, dailyGoal, streak } = PROFILE;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <ProfileHeader name={name} avatar={avatar} />

        <Card style={styles.saveCard}>
          <Text style={styles.saveTitle}>Save Your Progress</Text>
          <Text style={styles.saveSubtitle}>
            Sign in to keep your progress, streaks, and achievements.
          </Text>
          <PrimaryButton label="Sign In" style={styles.signInButton} />
        </Card>

        <Card
          clip
          padded={false}
          onPress={() => {}}
          accessibilityLabel={`My tutor, ${tutor.name}`}
          style={styles.tutorCard}>
          <ImagePlaceholder
            source={tutor.avatar}
            icon="person"
            tint={Colors.textSecondary}
            style={styles.tutorImage}
            accessibilityLabel={tutor.name}
          />
          <View style={styles.tutorLabel}>
            <Text style={styles.tutorText}>My Tutor &#183; {tutor.name}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </View>
        </Card>

        <View style={styles.pairRow}>
          <Card onPress={() => {}} accessibilityLabel="Change language" style={styles.pairCard}>
            <View style={styles.pairBody}>
              {language.image ? (
                <ImagePlaceholder source={language.image} style={styles.flagCircle} />
              ) : (
                <View style={[styles.flagCircle, styles.flagFallback]}>
                  <Text style={styles.flagEmoji}>{language.flag}</Text>
                </View>
              )}
            </View>
            <CardLabel text="Language" />
          </Card>

          <Card onPress={() => {}} accessibilityLabel={`Level ${level}`} style={styles.pairCard}>
            <View style={styles.pairBody}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
            <CardLabel text="Level" />
          </Card>
        </View>

        <Card onPress={() => {}} accessibilityLabel={interest.title} style={styles.interestCard}>
          {interest.image ? (
            <ImagePlaceholder source={interest.image} style={styles.interestImage} />
          ) : (
            <Text style={styles.interestEmoji}>{interest.emoji}</Text>
          )}
          <View style={styles.interestBody}>
            <View style={styles.interestTitleRow}>
              <Text style={styles.interestTitle}>{interest.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text} />
            </View>
            <Text style={styles.interestSubtitle}>{interest.subtitle}</Text>
          </View>
        </Card>

        <DailyGoalCard goal={dailyGoal} onAdjustGoal={() => {}} />

        <StreakCard streak={streak} onPress={() => router.push('/streak')} />
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
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
    gap: Spacing.lg,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.maxContentWidth,
  },
  saveCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  saveTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  saveSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  signInButton: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: Radius.pill,
    marginTop: Spacing.md,
  },
  tutorCard: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tutorImage: {
    width: 96,
    height: '100%',
    backgroundColor: Colors.neutral,
  },
  tutorLabel: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  tutorText: {
    fontSize: FontSize.bodyLarge + 2,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  pairRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pairCard: {
    flex: 1,
    height: 148,
    justifyContent: 'space-between',
  },
  pairBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagCircle: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  flagFallback: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  flagEmoji: {
    fontSize: 52,
    lineHeight: 62,
  },
  levelText: {
    fontSize: 56,
    fontWeight: FontWeight.bold,
    color: Colors.display,
    letterSpacing: -1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  labelText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  interestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  interestImage: {
    width: 48,
    height: 48,
  },
  interestEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  interestBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  interestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  interestTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  interestSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});
