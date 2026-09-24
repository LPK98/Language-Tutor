import { StyleSheet, Text, View } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import type { SpeechCollection } from '@/constants/vocabulary';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type CollectionCardProps = {
  collection: SpeechCollection;
  /** Derived from the word list rather than stored, so it cannot drift. */
  wordCount: number;
};

/** Centred summary card introducing the word list beneath it. */
export function CollectionCard({ collection, wordCount }: CollectionCardProps) {
  return (
    <View style={styles.card}>
      {collection.image ? (
        <ImagePlaceholder source={collection.image} style={styles.image} />
      ) : (
        <Text style={styles.emoji}>{collection.emoji}</Text>
      )}

      <Text style={styles.title}>{collection.title}</Text>
      <Text style={styles.subtitle}>{collection.subtitle}</Text>

      <View style={styles.countPill}>
        <Text style={styles.countLabel}>{wordCount} words</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 156,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  image: {
    width: 72,
    height: 72,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 68,
  },
  title: {
    marginTop: Spacing.lg,
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  countPill: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.pill,
    backgroundColor: Colors.neutral,
  },
  countLabel: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
});
