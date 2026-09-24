import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Colors } from '@/constants/theme';

/** Keep the native splash up until the animated overlay has taken its place. */
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (fast refresh, or the splash module is unavailable on web).
});

/** Matches the `expo-splash-screen` config in app.json so there is no visual jump. */
const LOGO_SIZE = 180;
const SPLASH_BACKGROUND = Colors.primary;
const SPLASH_BACKGROUND_DARK = '#1E3A8A';

const SETTLE_MS = 460;
const LIFT_MS = 320;
const FADE_DELAY_MS = 520;
const FADE_MS = 300;

type SplashGateProps = {
  children: ReactNode;
};

/**
 * Renders a copy of the native splash over the app, then scales and fades it
 * away once React has mounted, so the hand-off reads as one continuous motion.
 */
export function SplashGate({ children }: SplashGateProps) {
  const scheme = useColorScheme();
  const [overlayVisible, setOverlayVisible] = useState(true);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const dismiss = useCallback(() => setOverlayVisible(false), []);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
      // Nothing to hide; the overlay still plays.
    });

    scale.value = withSequence(
      withTiming(1.06, { duration: SETTLE_MS, easing: Easing.out(Easing.cubic) }),
      withTiming(0.9, { duration: LIFT_MS, easing: Easing.in(Easing.cubic) }),
    );

    opacity.value = withDelay(
      FADE_DELAY_MS,
      withTiming(0, { duration: FADE_MS, easing: Easing.out(Easing.quad) }, (finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(dismiss);
        }
      }),
    );
  }, [dismiss, opacity, scale]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.root}>
      {children}

      {overlayVisible ? (
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.overlay,
            {
              backgroundColor:
                scheme === 'dark' ? SPLASH_BACKGROUND_DARK : SPLASH_BACKGROUND,
            },
            overlayStyle,
          ]}>
          <Animated.View style={logoStyle}>
            <Image
              source={require('@/assets/images/splash-icon.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Language Tutor"
            />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
