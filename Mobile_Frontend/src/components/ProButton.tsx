import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

type ProButtonProps = {
  onPress?: () => void;
  /** Reflects entitlement state; PRO members see the primary blue pill. */
  isPro?: boolean;
};

/** Premium pill shown in the app header. */
export function ProButton({ onPress, isPro = false }: ProButtonProps) {
  const background = isPro ? Colors.primary : Colors.grammar;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPro ? 'Manage BetterSpeak PRO' : 'Upgrade to BetterSpeak PRO'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        Shadow.card,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}>
      <Ionicons name="sparkles" size={14} color={Colors.white} />
      <Text style={styles.label}>PRO</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: Colors.white,
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
  },
});
