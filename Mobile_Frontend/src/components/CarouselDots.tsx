import { StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type CarouselDotsProps = {
  count: number;
  activeIndex: number;
  /** Active dot colour, normally the current category colour. */
  activeColor: string;
};

export function CarouselDots({ count, activeIndex, activeColor }: CarouselDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex && [styles.activeDot, { backgroundColor: activeColor }],
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
  },
  activeDot: {
    width: 22,
  },
});
