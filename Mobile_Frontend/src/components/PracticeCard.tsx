import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import type { RecommendedItem } from '@/constants/practice';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type PracticeCardProps = {
  item: RecommendedItem;
  onPress?: () => void;
};

/** Square tile in the "Recommended for you" row. */
export function PracticeCard({ item, onPress }: PracticeCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <View style={styles.tile}>
        {item.image ? (
          <ImagePlaceholder source={item.image} style={styles.image} />
        ) : (
          <Text style={styles.emoji}>{item.emoji}</Text>
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  tile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '64%',
    height: '64%',
  },
  emoji: {
    fontSize: 52,
    lineHeight: 62,
  },
  label: {
    marginTop: Spacing.md,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
  },
});
