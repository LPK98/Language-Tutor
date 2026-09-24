import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProButton } from './ProButton';

import { Colors, FontSize, Layout, Radius, Spacing } from '@/constants/theme';

type AppHeaderProps = {
  /** Flag emoji for the language being learned. */
  flag?: string;
  languageLabel?: string;
  isPro?: boolean;
  onPressLanguage?: () => void;
  onPressPro?: () => void;
};

/** Language selector on the left, PRO entitlement pill on the right. */
export function AppHeader({
  flag = '\u{1F1EC}\u{1F1E7}',
  languageLabel = 'English (UK)',
  isPro = false,
  onPressLanguage,
  onPressPro,
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Change language, currently ${languageLabel}`}
        onPress={onPressLanguage}
        style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}>
        <Text style={styles.flag}>{flag}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
      </Pressable>

      <ProButton isPro={isPro} onPress={onPressPro} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.6,
  },
  flag: {
    fontSize: FontSize.title,
    lineHeight: 28,
  },
});
