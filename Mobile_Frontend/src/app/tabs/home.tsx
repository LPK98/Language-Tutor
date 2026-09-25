import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { BOTTOM_NAV_CLEARANCE } from '@/components/BottomNavigation';
import { CarouselDots } from '@/components/CarouselDots';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { LessonCard } from '@/components/LessonCard';
import { TutorBanner } from '@/components/TutorBanner';
import { EMMA, LESSONS, categoryColor } from '@/constants/lessons';
import { Colors, FontSize, FontWeight, Layout, Radius, Spacing } from '@/constants/theme';

/** Share of the content width the lesson artwork occupies. */
const ILLUSTRATION_WIDTH = '68%';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const activeLesson = LESSONS[activeIndex];
  const accent = categoryColor(activeLesson.category);

  /** Pages span the full window so `pagingEnabled` snaps cleanly. */
  const pageWidth = width;

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(Math.min(Math.max(index, 0), LESSONS.length - 1));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AppHeader onPressPro={() => router.push('/tabs/profile')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.gutter}>
          <TutorBanner
            tutorName={EMMA.name}
            avatar={EMMA.avatar}
            accentColor={accent}
            onPressFreeTalk={() => router.push('/tabs/practice')}
          />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          decelerationRate="fast"
          style={styles.carousel}>
          {LESSONS.map((lesson) => {
            const lessonAccent = categoryColor(lesson.category);

            return (
              <View key={lesson.id} style={[styles.page, { width: pageWidth }]}>
                <View style={styles.pageInner}>
                  <View style={styles.lessonHeading}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={[styles.lessonCategory, { color: lessonAccent }]}>
                      {lesson.categoryLabel.toUpperCase()}
                    </Text>
                  </View>

                  <ImagePlaceholder
                    source={lesson.image}
                    icon="sparkles-outline"
                    label={`${lesson.categoryLabel} illustration`}
                    tint={lessonAccent}
                    contentFit="contain"
                    style={styles.illustration}
                    accessibilityLabel={`${lesson.title} illustration`}
                  />

                  {/* Start opens the lesson; it must not move the carousel. */}
                  <LessonCard lesson={lesson} onStart={() => {}} />
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.gutter}>
          <CarouselDots count={LESSONS.length} activeIndex={activeIndex} activeColor={accent} />
        </View>
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
    paddingTop: Spacing.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
    gap: Spacing.xl,
  },
  /** Sections outside the full-bleed carousel keep the screen gutters. */
  gutter: {
    paddingHorizontal: Layout.screenPadding,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  carousel: {
    /** Cancels the vertical ScrollView's centring so pages stay full width. */
    alignSelf: 'stretch',
  },
  page: {
    alignItems: 'center',
  },
  pageInner: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.xl,
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
    /** Tune this to scale the artwork; the box keeps its shape. */
    width: ILLUSTRATION_WIDTH,
    alignSelf: 'center',
    /** Suits the near-square transparent illustrations. */
    aspectRatio: 4 / 3,
    borderRadius: Radius.xl,
  },
});
