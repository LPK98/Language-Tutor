import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Term } from '@/constants/vocabulary';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

type TermRowProps = {
  term: Term;
  expanded: boolean;
  onToggle: () => void;
};

/** Collapsed the row shows the term; expanded it reveals meaning and usage. */
export function TermRow({ term, expanded, onToggle }: TermRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={term.term}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, Shadow.card, pressed && styles.pressed]}>
      <View style={styles.headline}>
        <Text style={styles.term} numberOfLines={1}>
          {term.term}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.text}
        />
      </View>

      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.definition}>{term.definition}</Text>
          <Text style={styles.example}>{term.example}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
  headline: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  term: {
    flex: 1,
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  body: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  definition: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 21,
  },
  example: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 21,
  },
});
