import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  /** Cards holding bleeding artwork need their corners to clip. */
  clip?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** White rounded surface with a hairline edge and soft elevation. */
export function Card({
  children,
  onPress,
  clip = false,
  padded = true,
  style,
  accessibilityLabel,
}: CardProps) {
  const base = [
    styles.card,
    Shadow.card,
    padded && styles.padded,
    clip && styles.clip,
    style,
  ] as StyleProp<ViewStyle>;

  if (!onPress) {
    return <View style={base}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  padded: {
    padding: Spacing.xl,
  },
  clip: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
  },
});
