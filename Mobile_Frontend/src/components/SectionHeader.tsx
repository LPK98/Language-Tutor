import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, Layout, Spacing } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  /** 'lg' for primary sections, 'md' for subordinate ones. */
  size?: 'md' | 'lg';
  /** Adds a trailing chevron and makes the title tappable. */
  onPress?: () => void;
  /** Optional right-aligned text action, used instead of the chevron. */
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionHeader({
  title,
  size = 'lg',
  onPress,
  actionLabel,
  onPressAction,
}: SectionHeaderProps) {
  const titleStyle = [styles.title, size === 'md' && styles.titleMd];

  return (
    <View style={styles.row}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onPress}
          style={({ pressed }) => [styles.titleRow, pressed && styles.pressed]}>
          <Text style={titleStyle}>{title}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.text} />
        </Pressable>
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  titleMd: {
    fontSize: FontSize.bodyLarge + 2,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    opacity: 0.6,
  },
  action: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
});
