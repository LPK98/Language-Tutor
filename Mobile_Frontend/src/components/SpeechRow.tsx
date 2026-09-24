import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SpeechWord } from '@/constants/vocabulary';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

type SpeechRowProps = {
  word: SpeechWord;
  onPressListen?: () => void;
  onPressPractice?: () => void;
};

/** A word with a playback control and a record-and-compare action. */
export function SpeechRow({ word, onPressListen, onPressPractice }: SpeechRowProps) {
  return (
    <View style={[styles.row, Shadow.card]}>
      <Text style={styles.word} numberOfLines={1}>
        {word.word}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Listen to ${word.word}`}
        onPress={onPressListen}
        style={({ pressed }) => [styles.listenButton, pressed && styles.pressed]}>
        <Ionicons name="volume-high" size={18} color={Colors.text} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Practice saying ${word.word}`}
        onPress={onPressPractice}
        style={({ pressed }) => [styles.practiceButton, pressed && styles.pressed]}>
        <Ionicons name="mic" size={17} color={Colors.primary} />
        <Text style={styles.practiceLabel}>Practice</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 68,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  pressed: {
    opacity: 0.7,
  },
  word: {
    flex: 1,
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  listenButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    height: 38,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },
  practiceLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});
