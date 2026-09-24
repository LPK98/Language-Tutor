import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { PracticeCategory } from '@/constants/practice';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

type CategoryCardProps = {
  category: PracticeCategory;
  onPress?: () => void;
};

/** Icon + label chip used in the horizontally scrolling category grid. */
export function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, Shadow.card, pressed && styles.pressed]}>
      <Ionicons name={category.icon} size={20} color={Colors.text} />
      <Text style={styles.label} numberOfLines={1}>
        {category.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
});
