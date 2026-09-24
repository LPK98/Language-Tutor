import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageContentFit } from 'expo-image';
import {
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

type ImagePlaceholderProps = {
  /** When null, a styled stand-in is rendered instead. */
  source: ImageSourcePropType | null;
  /** Icon shown by the stand-in. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Caption shown by the stand-in. */
  label?: string;
  tint?: string;
  /** 'contain' suits transparent illustrations; 'cover' suits photos. */
  contentFit?: ImageContentFit;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Renders artwork when it exists, and a tasteful placeholder while the real
 * assets are still missing. Screens stay identical once images are dropped in.
 */
export function ImagePlaceholder({
  source,
  icon = 'image-outline',
  label,
  tint = Colors.textSecondary,
  contentFit = 'cover',
  style,
  accessibilityLabel,
}: ImagePlaceholderProps) {
  if (source) {
    return (
      <Image
        source={source}
        // View and Image styles differ only in `overflow`; the shared prop keeps
        // callers from having to know which branch renders.
        style={style as StyleProp<ImageStyle>}
        contentFit={contentFit}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  return (
    <View style={[styles.placeholder, style]} accessibilityLabel={accessibilityLabel}>
      <Ionicons name={icon} size={40} color={tint} />
      {label ? <Text style={[styles.label, { color: tint }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
});
