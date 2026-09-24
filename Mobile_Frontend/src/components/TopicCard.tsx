import { Pressable, StyleSheet, Text } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import type { PracticeTopic } from '@/constants/practice';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

export const TOPIC_CARD_WIDTH = 148;

type TopicCardProps = {
  topic: PracticeTopic;
  onPress?: () => void;
};

/** Image card inside a category's horizontal rail. */
export function TopicCard({ topic, onPress }: TopicCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${topic.title}, ${topic.minutes} minutes`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <ImagePlaceholder
        source={topic.image}
        icon="image-outline"
        style={styles.image}
        accessibilityLabel={topic.title}
      />
      <Text style={styles.title} numberOfLines={1}>
        {topic.title}
      </Text>
      <Text style={styles.meta}>{topic.minutes} min</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: TOPIC_CARD_WIDTH,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  title: {
    marginTop: Spacing.md,
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  meta: {
    marginTop: Spacing.xs,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});
