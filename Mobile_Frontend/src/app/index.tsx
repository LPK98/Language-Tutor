import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const [progress] = useState(() => new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        router.replace('/tabs/home');
      }
    });
  }, [progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Logo + App Name */}
      <View style={styles.brandContainer}>
        <Image
          source={require('../../assets/images/language-tutor-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.brandName}>Better Speak</Text>
      </View>

      {/* Loading Progress Bar */}
      <View
        style={[
          styles.progressContainer,
          {
            bottom: Math.max(insets.bottom + 25, 45),
          },
        ]}
      >
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // --------------------------------
  // Logo + App Name
  // --------------------------------

  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },

  logo: {
    width: 245,
    height: 245,
  },

  // --------------------------------
  // Better Speak Text
  // --------------------------------

  brandName: {
    marginTop: 30,

    fontSize: 48,
    lineHeight: 58,

    fontWeight: '700',

    color: '#0878D1',

    letterSpacing: -1.5,

    textAlign: 'center',
  },

  // --------------------------------
  // Loading Bar
  // --------------------------------

  progressContainer: {
    position: 'absolute',

    left: 0,
    right: 0,

    alignItems: 'center',
  },

  progressBackground: {
    width: 290,
    height: 13,

    borderRadius: 10,

    overflow: 'hidden',

    backgroundColor: '#EAF6FD',
  },

  progressBar: {
    height: '100%',

    borderRadius: 10,

    backgroundColor: '#249BE8',
  },
});