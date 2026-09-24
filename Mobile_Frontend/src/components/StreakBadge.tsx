import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { ImagePlaceholder } from './ImagePlaceholder';

import { Colors, FontWeight, Radius } from '@/constants/theme';

type StreakBadgeProps = {
  days: number;
  /** Flame artwork; falls back to an emoji badge when absent. */
  image?: ImageSourcePropType | null;
};

/** Flame with the streak count reading through it. */
export function StreakBadge({ days, image = null }: StreakBadgeProps) {
  return (
    <View style={styles.badge} accessibilityLabel={`${days} day streak`}>
      <View style={styles.halo} />
      {image ? (
        <ImagePlaceholder source={image} style={styles.art} />
      ) : (
        <Text style={styles.flame}>{'\u{1F525}'}</Text>
      )}
      <Text style={styles.count}>{days}</Text>
    </View>
  );
}

const SIZE = 150;

const styles = StyleSheet.create({
  badge: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.pill,
    backgroundColor: '#FFF3E0',
  },
  art: {
    width: SIZE * 0.82,
    height: SIZE * 0.82,
  },
  flame: {
    fontSize: 108,
    lineHeight: 128,
  },
  count: {
    position: 'absolute',
    /** Sits in the body of the flame rather than its tip. */
    top: SIZE * 0.47,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
