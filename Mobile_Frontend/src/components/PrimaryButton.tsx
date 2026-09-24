import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  /** Defaults to the brand primary; pass a category colour to theme the CTA. */
  color?: string;
  variant?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  color = Colors.primary,
  variant = 'solid',
  style,
}: PrimaryButtonProps) {
  const isSolid = variant === 'solid';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSolid
          ? [{ backgroundColor: color }, Shadow.card]
          : { borderWidth: 1.5, borderColor: color },
        pressed && styles.pressed,
        style,
      ]}>
      <Text style={[styles.label, { color: isSolid ? Colors.white : color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
  },
});
