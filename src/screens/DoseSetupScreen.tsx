import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Droplet, Play } from 'lucide-react-native';
import theme from '../constants/theme';
import {
  CARD_FRAME,
  CARD_MAX_W,
  DOSE_BIG_STEP,
  DOSE_MAX,
  DOSE_MIN,
  DOSE_STEP,
  GRID_CHIP_W,
  GRID_GAP,
  GRID_W,
  RATIO_MAX,
  RATIO_MIN,
  RATIO_STEP,
} from '../constants/config';
import ScreenShell from '../components/ScreenShell';
import AppHeader from '../components/AppHeader';
import Stepper from '../components/Stepper';
import PrimaryButton from '../components/PrimaryButton';
import { methodById } from '../game/methods';
import type { MethodId } from '../game/methods';
import { waterFor } from '../game/brewEngine';
import { ratioLabel, waterLabel } from '../utils/format';
import { useSettings } from '../hooks/useSettings';

type Props = {
  methodId: MethodId;
  dose: number;
  ratio: number;
  onDose: (value: number) => void;
  onRatio: (value: number) => void;
  onBack: () => void;
  onStart: () => void;
};

const QUICK = [
  { ratio: 13, label: 'STRONG' },
  { ratio: 15, label: 'BALANCED' },
  { ratio: 17, label: 'LIGHT' },
];

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function QuickChip({
  ratio,
  label,
  active,
  onPress,
}: {
  ratio: number;
  label: string;
  active: boolean;
  onPress: (value: number) => void;
}) {
  const handle = useCallback(() => onPress(ratio), [onPress, ratio]);

  return (
    <Pressable
      onPress={handle}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={styles.quickPress}>
      <View style={[styles.quick, active ? styles.quickOn : styles.quickOff]}>
        <Text style={[styles.quickRatio, active ? styles.quickTextOn : styles.quickTextOff]}>
          {ratioLabel(ratio)}
        </Text>
        <Text style={[styles.quickLabel, active ? styles.quickTextOn : styles.quickTextOff]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function DoseSetupScreen({
  methodId,
  dose,
  ratio,
  onDose,
  onRatio,
  onBack,
  onStart,
}: Props) {
  const method = methodById(methodId);
  const { units, buzz } = useSettings();
  const ml = waterFor(dose, ratio);

  const enter = useRef(new Animated.Value(28)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enter, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [enter, fade]);

  useEffect(() => {
    pop.setValue(1.12);
    Animated.spring(pop, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
  }, [ml, pop]);

  const tick = useCallback(() => buzz(12), [buzz]);

  const pours = method.steps.filter(s => s.verb === 'POUR TO').length;

  return (
    <ScreenShell overlay={theme.gradients.lightOverlay}>
      <AppHeader
        title="DOSE SETUP"
        onBack={onBack}
        rightSlot={
          <View style={styles.methodPill}>
            <Text style={styles.methodPillText} numberOfLines={1}>
              {method.chip}
            </Text>
          </View>
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[styles.body, { opacity: fade, transform: [{ translateY: enter }] }]}>
        <Stepper
          label="COFFEE DOSE"
          value={dose}
          min={DOSE_MIN}
          max={DOSE_MAX}
          step={DOSE_STEP}
          bigStep={DOSE_BIG_STEP}
          format={v => v + ' g'}
          onChange={onDose}
          onTick={tick}
          valueSize={40}
        />

        <View style={styles.gap} />

        <Stepper
          label="BREW RATIO"
          value={ratio}
          min={RATIO_MIN}
          max={RATIO_MAX}
          step={RATIO_STEP}
          format={ratioLabel}
          onChange={onRatio}
          onTick={tick}
          valueSize={34}
          accent={theme.colors.mustard}
        />

        <View style={styles.quickRow}>
          {QUICK.map(q => (
            <QuickChip
              key={q.ratio}
              ratio={q.ratio}
              label={q.label}
              active={ratio === q.ratio}
              onPress={onRatio}
            />
          ))}
        </View>

        <Animated.View pointerEvents="box-none" style={[styles.waterWrap, { transform: [{ scale: pop }] }]}>
          <LinearGradient
            colors={['#8FB578', '#7FA46B', '#6B9158']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.water}>
            <View style={styles.waterIcon}>
              <Droplet size={28} color="#F4FAF0" strokeWidth={2.4} />
            </View>
            <View style={styles.waterText}>
              <Text style={styles.waterValue}>{waterLabel(ml, units)}</Text>
              <Text style={styles.waterCaption}>
                {'TOTAL WATER · ' + pours + ' POURS'}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      <View style={styles.controls}>
        <Text style={styles.hint}>{'TAP ± TO DIAL IN · HOLD TO RUN FAST'}</Text>
        <PrimaryButton label="START BREWING" onPress={onStart} Icon={Play} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: CARD_MAX_W,
    alignSelf: 'center',
    paddingTop: 16,
  },
  gap: { height: 12 },
  methodPill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(217,123,77,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.primaryDeep,
  },
  quickRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
    width: GRID_W,
    alignSelf: 'center',
    paddingHorizontal: CARD_FRAME,
    marginTop: 12,
  },
  quickPress: { width: GRID_CHIP_W, height: 52 },
  quick: {
    width: GRID_CHIP_W,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickOn: {
    backgroundColor: 'rgba(217,179,108,0.24)',
    borderColor: theme.colors.mustard,
  },
  quickOff: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  quickRatio: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  quickLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  quickTextOn: { color: theme.colors.walnut },
  quickTextOff: { color: theme.colors.textSecondary },
  waterWrap: { marginTop: 14 },
  water: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(244,250,240,0.35)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...theme.shadows.ctaSage,
  },
  waterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244,250,240,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  waterText: { flex: 1 },
  waterValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F4FAF0',
    fontVariant: ['tabular-nums'],
  },
  waterCaption: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: 'rgba(244,250,240,0.78)',
    marginTop: 2,
  },
  controls: {
    width: CARD_MAX_W,
    alignSelf: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  hint: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default DoseSetupScreen;
