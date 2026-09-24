import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, Layout, Radius, Shadow, Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
};

/** Circular back control with a centred title, used by pushed screens. */
export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, Shadow.card, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Balances the back button so the title stays optically centred. */}
      <View style={styles.spacer} />
    </View>
  );
}

const BUTTON_SIZE = 40;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  spacer: {
    width: BUTTON_SIZE,
  },
});
