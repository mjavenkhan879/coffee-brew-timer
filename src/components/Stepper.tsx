import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import theme from '../constants/theme';
import {
  BIG_STEP_AFTER_MS,
  LONG_PRESS_MS,
  REPEAT_MS,
  SPRING_BUTTON,
} from '../constants/config';
import { clamp, roundTo } from '../game/brewEngine';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  bigStep?: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
  valueSize?: number;
  accent?: string;
  onTick?: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function StepButton({
  dir,
  onFire,
  accent,
}: {
  dir: 1 | -1;
  onFire: (bigStep: boolean) => void;
  accent: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldSinceRef = useRef(0);
  const fireRef = useRef(onFire);
  fireRef.current = onFire;

  const stopRepeat = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (delayRef.current !== null) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  }, []);

  useEffect(() => stopRepeat, [stopRepeat]);

  const down = useCallback(() => {
    Animated.spring(scale, { toValue: 0.9, ...SPRING_BUTTON }).start();
    heldSinceRef.current = Date.now();
    delayRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => {
        fireRef.current(Date.now() - heldSinceRef.current > BIG_STEP_AFTER_MS);
      }, REPEAT_MS);
    }, LONG_PRESS_MS);
  }, [scale]);

  const up = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...SPRING_BUTTON }).start();
    stopRepeat();
  }, [scale, stopRepeat]);

  const tap = useCallback(() => {
    fireRef.current(false);
  }, []);

  const Icon = dir === 1 ? Plus : Minus;

  return (
    <Pressable
      onPress={tap}
      onPressIn={down}
      onPressOut={up}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={dir === 1 ? 'Increase' : 'Decrease'}
      style={styles.btnPress}>
      <Animated.View
        style={[
          styles.btn,
          { borderColor: accent, backgroundColor: accent + '14', transform: [{ scale }] },
        ]}>
        <Icon size={24} color={accent} strokeWidth={3} />
      </Animated.View>
    </Pressable>
  );
}

function StepperBase({
  label,
  value,
  min,
  max,
  step,
  bigStep,
  format,
  onChange,
  valueSize = 42,
  accent = theme.colors.primary,
  onTick,
}: Props) {
  const blink = useRef(new Animated.Value(1)).current;
  const valueRef = useRef(value);
  valueRef.current = value;

  const apply = useCallback(
    (dir: 1 | -1, big: boolean) => {
      const delta = (big && bigStep ? bigStep : step) * dir;
      const next = clamp(roundTo(valueRef.current + delta, step), min, max);
      if (next === valueRef.current) {
        return;
      }
      blink.setValue(0.45);
      Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: true }).start();
      onChange(next);
      if (onTick) {
        onTick();
      }
    },
    [bigStep, blink, max, min, onChange, onTick, step],
  );

  const dec = useCallback((big: boolean) => apply(-1, big), [apply]);
  const inc = useCallback((big: boolean) => apply(1, big), [apply]);

  return (
    <View style={styles.card}>
      <View style={styles.hairline} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <StepButton dir={-1} onFire={dec} accent={accent} />
        <View style={styles.valueSlot}>
          <Animated.Text
            numberOfLines={1}
            style={[styles.value, { fontSize: valueSize, opacity: blink }]}>
            {format(value)}
          </Animated.Text>
        </View>
        <StepButton dir={1} onFire={inc} accent={accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    ...theme.shadows.card,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: theme.colors.hairline,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textSecondary,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  valueSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  value: {
    fontWeight: '800',
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  btnPress: { width: 56, height: 56 },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const Stepper = React.memo(StepperBase);
export default Stepper;
