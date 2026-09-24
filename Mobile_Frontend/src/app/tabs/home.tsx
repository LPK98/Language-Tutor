import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { BOTTOM_NAV_CLEARANCE } from '@/components/BottomNavigation';
import { CarouselDots } from '@/components/CarouselDots';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { LessonCard } from '@/components/LessonCard';
import { TutorBanner } from '@/components/TutorBanner';
import { EMMA, LESSONS, categoryColor } from '@/constants/lessons';
import { Colors, FontSize, FontWeight, Layout, Radius, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const lesson = LESSONS[activeIndex];
  const accent = categoryColor(lesson.category);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AppHeader onPressPro={() => router.push('/tabs/profile')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <TutorBanner
          tutorName={EMMA.name}
          avatar={EMMA.avatar}
          accentColor={accent}
          onPressFreeTalk={() => router.push('/tabs/practice')}
        />

        <View style={styles.lessonHeading}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={[styles.lessonCategory, { color: accent }]}>
            {lesson.categoryLabel.toUpperCase()}
          </Text>
        </View>

        <ImagePlaceholder
          source={lesson.image}
          icon="sparkles-outline"
          label={`${lesson.categoryLabel} illustration`}
          tint={accent}
          style={styles.illustration}
          accessibilityLabel={`${lesson.title} illustration`}
        />

        <CarouselDots count={LESSONS.length} activeIndex={activeIndex} activeColor={accent} />

        <LessonCard
          lesson={lesson}
          onStart={() => setActiveIndex((current) => (current + 1) % LESSONS.length)}
        />
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
    paddingTop: Spacing.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
    gap: Spacing.xl,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.maxContentWidth,
  },
  lessonHeading: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lessonTitle: {
    fontSize: FontSize.pageTitle,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  lessonCategory: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.4,
  },
  illustration: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Radius.xl,
  },
});
