import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';
import { LOADER_DURATION_MS, SCREEN_FADE_MS } from '../constants/config';
import assets from '../assets';
import ScreenShell from '../components/ScreenShell';

const BAR_W = 190;

function Steam({
  size,
  left,
  top,
  delay,
}: {
  size: number;
  left: number;
  top: number;
  delay: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 2600,
          delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, drift]);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const opacity = drift.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.steam,
        {
          width: size,
          height: size,
          left,
          top,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export function LoaderScreen({ onDone }: { onDone: () => void }) {
  const medallion = useRef(new Animated.Value(0.82)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleShift = useRef(new Animated.Value(14)).current;
  const subFade = useRef(new Animated.Value(0)).current;
  const barFade = useRef(new Animated.Value(0)).current;
  const barFill = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    Animated.spring(medallion, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const breath = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breath.start();

    Animated.parallel([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 420,
        delay: 260,
        useNativeDriver: true,
      }),
      Animated.timing(titleShift, {
        toValue: 0,
        duration: 420,
        delay: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(subFade, {
      toValue: 1,
      duration: 360,
      delay: 520,
      useNativeDriver: true,
    }).start();

    Animated.timing(barFade, {
      toValue: 1,
      duration: 300,
      delay: 700,
      useNativeDriver: true,
    }).start();

    // width cannot ride the native driver - the single documented exception,
    // kept to this one 5px progress bar.
    Animated.timing(barFill, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const exit = setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: SCREEN_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => onDoneRef.current());
    }, LOADER_DURATION_MS);

    return () => {
      clearTimeout(exit);
      breath.stop();
    };
  }, [barFade, barFill, breathe, medallion, screenFade, subFade, titleFade, titleShift]);

  const rotate = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });
  const barWidth = barFill.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_W] });

  return (
    <Animated.View pointerEvents="box-none" style={[styles.root, { opacity: screenFade }]}>
      <ScreenShell
        overlay={theme.gradients.loaderOverlay}
        decor={
          <>
            <Steam size={180} left={38} top={130} delay={0} />
            <Steam size={140} left={210} top={220} delay={700} />
            <Steam size={100} left={120} top={180} delay={1400} />
          </>
        }>
        <View style={styles.center}>
          <Animated.View
            style={[styles.medallion, { transform: [{ scale: medallion }, { rotate }] }]}>
            <Image source={assets.logo} style={styles.logo} />
          </Animated.View>

          <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleShift }] }}>
            <Text style={styles.brand}>COFFEE BREW</Text>
            <Text style={styles.brandSub}>TIMER</Text>
          </Animated.View>

          <Animated.Text style={[styles.tagline, { opacity: subFade }]}>
            {'POUR OVER · FRENCH PRESS · AEROPRESS'}
          </Animated.Text>

          <Animated.View style={[styles.barBlock, { opacity: barFade }]}>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFillWrap, { width: barWidth }]}>
                <LinearGradient
                  colors={theme.gradients.progress}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.barFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.loading}>{'HEATING WATER…'}</Text>
          </Animated.View>
        </View>
      </ScreenShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  steam: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(250,245,236,0.07)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  medallion: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: 'rgba(250,245,236,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(217,123,77,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: { width: 132, height: 132, resizeMode: 'contain' },
  brand: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 5,
    color: theme.colors.textOnDark,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 3 },
  },
  brandSub: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 11,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 3 },
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: theme.colors.textOnDarkDim,
    marginTop: 16,
    textAlign: 'center',
  },
  barBlock: { alignItems: 'center', marginTop: 40 },
  barTrack: {
    width: BAR_W,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(250,245,236,0.14)',
    overflow: 'hidden',
  },
  barFillWrap: { height: 5, borderRadius: 3, overflow: 'hidden' },
  barFill: { flex: 1, borderRadius: 3 },
  loading: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(250,245,236,0.45)',
    marginTop: 12,
  },
});

export default LoaderScreen;
