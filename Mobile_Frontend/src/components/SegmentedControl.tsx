import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';

export type Segment<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Pill-track filter; the selected segment floats as a white pill. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track}>
      {segments.map((segment, index) => {
        const selected = segment.value === value;
        const previousSelected = index > 0 && segments[index - 1].value === value;
        /** Hairline dividers only appear between two unselected segments. */
        const showDivider = index > 0 && !selected && !previousSelected;

        return (
          <View key={segment.value} style={styles.segmentWrap}>
            {showDivider ? <View style={styles.divider} /> : null}
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={segment.label}
              onPress={() => onChange(segment.value)}
              style={({ pressed }) => [
                styles.segment,
                selected && [styles.segmentSelected, Shadow.card],
                pressed && !selected && styles.pressed,
              ]}>
              <Text
                style={[styles.label, selected && styles.labelSelected]}
                numberOfLines={1}>
                {segment.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const TRACK_HEIGHT = 44;
const INSET = 3;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
    backgroundColor: Colors.neutral,
    padding: INSET,
  },
  segmentWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  divider: {
    position: 'absolute',
    left: 0,
    top: '25%',
    height: '50%',
    width: 1,
    backgroundColor: Colors.border,
  },
  segment: {
    height: TRACK_HEIGHT - INSET * 2,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  segmentSelected: {
    backgroundColor: Colors.background,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  labelSelected: {
    fontWeight: FontWeight.semibold,
  },
});
