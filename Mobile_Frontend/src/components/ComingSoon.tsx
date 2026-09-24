import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BOTTOM_NAV_CLEARANCE } from './BottomNavigation';

import { Colors, FontSize, FontWeight, Layout, Spacing } from '@/constants/theme';

type ComingSoonProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Temporary tab body; replaced as each screen phase lands. */
export function ComingSoon({ title, icon }: ComingSoonProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <Ionicons name={icon} size={44} color={Colors.border} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Coming next.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  title: {
    fontSize: FontSize.pageTitle,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});
