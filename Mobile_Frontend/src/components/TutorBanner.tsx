import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

type TutorBannerProps = {
  tutorName: string;
  avatar: ImageSourcePropType | null;
  /** Accent used for the banner border; defaults to the grammar purple. */
  accentColor?: string;
  onPressFreeTalk?: () => void;
};

/**
 * Hero portrait of the AI tutor with a translucent "Free Talk" entry point.
 * Sizing is driven by aspectRatio so it scales across phone widths.
 */
export function TutorBanner({
  tutorName,
  avatar,
  accentColor = Colors.grammar,
  onPressFreeTalk,
}: TutorBannerProps) {
  return (
    <View style={[styles.frame, Shadow.card, { borderColor: accentColor }]}>
      <ImagePlaceholder
        source={avatar}
        icon="person"
        label={tutorName}
        tint={accentColor}
        style={styles.image}
        accessibilityLabel={`${tutorName}, your tutor`}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onPressFreeTalk}
        style={({ pressed }) => [styles.freeTalkPill, pressed && styles.pressed]}>
        <Ionicons name="mic" size={14} color={Colors.white} />
        <Text style={styles.freeTalkLabel}>Free Talk</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.xxl,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  freeTalkPill: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    height: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.overlay,
  },
  pressed: {
    opacity: 0.8,
  },
  freeTalkLabel: {
    color: Colors.white,
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
  },
});
