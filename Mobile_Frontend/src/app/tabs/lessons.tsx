import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BOTTOM_NAV_CLEARANCE } from '@/components/BottomNavigation';
import { LearningPath } from '@/components/LearningPath';
import { TutorHero } from '@/components/TutorHero';
import { BEGINNER_PATH } from '@/constants/learningPath';
import { EMMA } from '@/constants/lessons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

export default function LessonsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never">
        <TutorHero tutorName={EMMA.name} image={EMMA.avatar} giftCount={1} streak={0} />

        <View style={styles.sheet}>
          <Text style={styles.level}>{BEGINNER_PATH.level.toUpperCase()}</Text>
          <LearningPath path={BEGINNER_PATH} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  sheet: {
    /** Lifts the white sheet over the bottom of the hero photo. */
    marginTop: -28,
    paddingTop: Spacing.xxl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  level: {
    fontSize: FontSize.label + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
});
