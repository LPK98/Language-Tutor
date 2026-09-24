import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavIcon, type NavIconName } from './NavIcon';

import { Colors, FontWeight, Layout, Radius, Shadow, Spacing } from '@/constants/theme';

type NavButtonProps = TabTriggerSlotProps & {
  icon: NavIconName;
  label: string;
};

/**
 * Single item in the floating bar. `isFocused` is injected by TabTrigger's
 * `asChild` slot, so the active pill stays in sync with the router.
 */
export function NavButton({ icon, label, isFocused, ...pressableProps }: NavButtonProps) {
  const color = isFocused ? Colors.primary : Colors.text;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
        <NavIcon name={icon} color={color} active={!!isFocused} />
      </View>
      <Text style={[styles.navLabel, { color }, isFocused && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

/** Rounded, floating container for the tab items. */
export function BottomNavigation({ children, ...rest }: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      pointerEvents="box-none"
      style={[styles.outer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
      <View style={[styles.bar, Shadow.floating]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xxxl,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    maxWidth: Layout.maxContentWidth,
    height: Layout.bottomNavHeight,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 46,
    height: 28,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.primarySoft,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  navLabelActive: {
    fontWeight: FontWeight.semibold,
  },
});

export const BOTTOM_NAV_CLEARANCE = Layout.bottomNavHeight + Spacing.xxxl + Spacing.lg;
