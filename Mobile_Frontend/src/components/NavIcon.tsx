import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';

export type NavIconName = 'home' | 'lessons' | 'practice' | 'profile';

type NavIconProps = {
  name: NavIconName;
  color: string;
  active: boolean;
  size?: number;
};

/**
 * Lessons and Practice have no close match in Ionicons, so they are drawn:
 * an S-shaped learning path, and a 2x2 dot cluster.
 */
export function NavIcon({ name, color, active, size = 22 }: NavIconProps) {
  if (name === 'home') {
    return <Ionicons name={active ? 'home' : 'home-outline'} size={size} color={color} />;
  }

  if (name === 'profile') {
    return <Ionicons name={active ? 'person' : 'person-outline'} size={size} color={color} />;
  }

  if (name === 'practice') {
    const dot = size * 0.34;
    return (
      <View style={[styles.dotGrid, { width: size, height: size }]}>
        {Array.from({ length: 4 }, (_, index) => (
          <View
            key={index}
            style={{
              width: dot,
              height: dot,
              borderRadius: Radius.pill,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    );
  }

  // Lessons: two half-rings stacked into an S, capped by a dot at each end.
  const arc = size * 0.46;
  const cap = size * 0.2;
  const ring = {
    width: arc,
    height: arc,
    borderRadius: arc / 2,
    borderWidth: Math.max(1.75, size * 0.09),
    borderColor: 'transparent',
  };

  return (
    <View style={[styles.path, { width: size, height: size }]}>
      <View
        style={[ring, { borderTopColor: color, borderRightColor: color, marginBottom: -arc * 0.1 }]}
      />
      <View style={[ring, { borderBottomColor: color, borderLeftColor: color }]} />
      <View
        style={[
          styles.cap,
          { width: cap, height: cap, borderRadius: Radius.pill, backgroundColor: color, top: 0, right: 0 },
        ]}
      />
      <View
        style={[
          styles.cap,
          { width: cap, height: cap, borderRadius: Radius.pill, backgroundColor: color, bottom: 0, left: 0 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
  },
  path: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cap: {
    position: 'absolute',
  },
});
