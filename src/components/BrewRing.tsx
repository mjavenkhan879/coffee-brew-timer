import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import theme from '../constants/theme';
import {
  RING_GAP,
  RING_SIZE,
  RING_STROKE_IN,
  RING_STROKE_OUT,
} from '../constants/config';
import { mmss } from '../utils/format';

type Props = {
  stepProgress: number;
  totalProgress: number;
  color: string;
  phase: string;
  verb: string;
  targetG: number;
  remainingMs: number;
  paused: boolean;
  pulsing: boolean;
};

const R_OUT = (RING_SIZE - RING_STROKE_OUT) / 2;
const R_IN = R_OUT - RING_STROKE_OUT - RING_GAP;
const C_OUT = 2 * Math.PI * R_OUT;
const C_IN = 2 * Math.PI * R_IN;
const CENTER = RING_SIZE / 2;

/**
 * Dual SVG ring. strokeDashoffset cannot take the native driver, so the arcs are
 * re-rendered from the 100ms ticker; only the halo uses Animated (opacity, native).
 */
function BrewRingBase({
  stepProgress,
  totalProgress,
  color,
  phase,
  verb,
  targetG,
  remainingMs,
  paused,
  pulsing,
}: Props) {
  const halo = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    if (!pulsing || paused) {
      halo.stopAnimation();
      Animated.timing(halo, { toValue: 0.12, duration: 240, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 0.38, duration: 900, useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0.15, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [halo, paused, pulsing]);

  const clampedStep = stepProgress < 0 ? 0 : stepProgress > 1 ? 1 : stepProgress;
  const clampedTotal = totalProgress < 0 ? 0 : totalProgress > 1 ? 1 : totalProgress;

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents="none"
        style={[styles.halo, { backgroundColor: color, opacity: halo }]}
      />
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <G rotation={-90} origin={CENTER + ', ' + CENTER}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_OUT}
            stroke="rgba(250,245,236,0.12)"
            strokeWidth={RING_STROKE_OUT}
            fill="none"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_OUT}
            stroke={color}
            strokeWidth={RING_STROKE_OUT}
            strokeLinecap="round"
            strokeDasharray={C_OUT}
            strokeDashoffset={C_OUT * (1 - clampedStep)}
            opacity={paused ? 0.55 : 1}
            fill="none"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_IN}
            stroke="rgba(250,245,236,0.10)"
            strokeWidth={RING_STROKE_IN}
            fill="none"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_IN}
            stroke={theme.colors.secondary}
            strokeWidth={RING_STROKE_IN}
            strokeLinecap="round"
            strokeDasharray={C_IN}
            strokeDashoffset={C_IN * (1 - clampedTotal)}
            opacity={0.85}
            fill="none"
          />
        </G>
      </Svg>

      <View pointerEvents="none" style={styles.center}>
        {paused ? <Text style={styles.paused}>PAUSED</Text> : null}
        <Text style={styles.countdown}>{mmss(remainingMs)}</Text>
        <Text style={styles.verb}>{verb}</Text>
        <Text style={[styles.target, { color }]}>{targetG} g</Text>
        <View style={[styles.phasePill, { borderColor: color + '77', backgroundColor: color + '1F' }]}>
          <Text style={[styles.phase, { color }]} numberOfLines={1}>
            {phase}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: RING_SIZE - 26,
    height: RING_SIZE - 26,
    borderRadius: RING_SIZE,
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paused: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    color: theme.colors.mustard,
    marginBottom: 2,
  },
  countdown: {
    fontSize: 52,
    fontWeight: '800',
    color: theme.colors.textOnDark,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  verb: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: 'rgba(250,245,236,0.6)',
    marginTop: 2,
  },
  target: { fontSize: 26, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  phasePill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: RING_SIZE - 70,
  },
  phase: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
});

export const BrewRing = React.memo(BrewRingBase);
export default BrewRing;
