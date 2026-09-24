import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/** Arc starts at the lower-left, sweeps clockwise over the top, ends lower-right. */
const START_ANGLE = 135;
const SWEEP = 270;
const SEGMENTS = 48;

type ArcGaugeProps = {
  /** 0..1; values outside the range are clamped. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  children?: ReactNode;
};

/**
 * Open-bottom ring drawn as a run of short rounded bars laid along the arc.
 * Keeps round end caps and exact partial progress without an SVG dependency.
 */
export function ArcGauge({
  progress,
  size = 226,
  strokeWidth = 10,
  trackColor = '#E3E4E7',
  progressColor = Colors.primary,
  children,
}: ArcGaugeProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  const bars = useMemo(() => {
    const centre = size / 2;
    const radius = (size - strokeWidth) / 2;
    const step = SWEEP / SEGMENTS;
    /** Slight overlap so neighbouring bars read as one continuous stroke. */
    const length = (2 * Math.PI * radius * step) / 360 + strokeWidth * 0.55;

    return Array.from({ length: SEGMENTS }, (_, index) => {
      const angle = START_ANGLE + (index + 0.5) * step;
      const radians = (angle * Math.PI) / 180;

      return {
        key: index,
        filled: (index + 1) / SEGMENTS <= clamped,
        style: {
          left: centre + radius * Math.cos(radians) - length / 2,
          top: centre + radius * Math.sin(radians) - strokeWidth / 2,
          width: length,
          height: strokeWidth,
          borderRadius: Radius.pill,
          transform: [{ rotate: `${angle + 90}deg` }],
        },
      };
    });
  }, [size, strokeWidth, clamped]);

  return (
    <View style={[styles.gauge, { width: size, height: size }]}>
      {bars.map((bar) => (
        <View
          key={bar.key}
          style={[
            styles.bar,
            bar.style,
            { backgroundColor: bar.filled ? progressColor : trackColor },
          ]}
        />
      ))}

      <View style={styles.centre} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gauge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
  },
  centre: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
