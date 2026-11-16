import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Droplet, Hourglass, ListOrdered, Pause, Play, SkipForward } from 'lucide-react-native';
import theme from '../constants/theme';
import { CARD_MAX_W, SCREEN_FADE_MS } from '../constants/config';
import ScreenShell from '../components/ScreenShell';
import AppHeader from '../components/AppHeader';
import BrewRing from '../components/BrewRing';
import { StatPill, StatRow, StatSlot } from '../components/StatPill';
import { methodById } from '../game/methods';
import type { MethodId } from '../game/methods';
import { buildSchedule, totalDuration, waterFor } from '../game/brewEngine';
import type { BrewResult } from '../game/brewEngine';
import { useBrewTimer } from '../hooks/useBrewTimer';
import { useSettings } from '../hooks/useSettings';
import { mmss } from '../utils/format';

type Props = {
  methodId: MethodId;
  dose: number;
  ratio: number;
  onAbort: () => void;
  onComplete: (result: BrewResult) => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Pressable OUTSIDE, Animated.View INSIDE — the inverse eats onPress on release builds. */
function ControlButton({
  label,
  Icon,
  onPress,
  tone,
  flex,
}: {
  label: string;
  Icon: typeof Play;
  onPress: () => void;
  tone: 'copper' | 'muted' | 'ghost';
  flex: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const down = useCallback(() => {
    Animated.spring(scale, { toValue: 0.95, tension: 40, friction: 7, useNativeDriver: true }).start();
  }, [scale]);

  const up = useCallback(() => {
    Animated.spring(scale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }).start();
  }, [scale]);

  const tint = tone === 'copper' ? '#FFF6EC' : theme.colors.textOnDark;

  const body = (
    <View style={styles.ctrlRow}>
      <Icon size={24} color={tint} strokeWidth={2.6} />
      <Text style={[styles.ctrlLabel, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={down}
      onPressOut={up}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.ctrlPress, { flex }]}>
      <Animated.View style={[styles.ctrlWrap, theme.shadows.cta, { transform: [{ scale }] }]}>
        {tone === 'copper' ? (
          <LinearGradient
            colors={theme.gradients.cta}
            locations={[0, 0.45, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.ctrlFill, styles.ctrlFillCopper]}>
            {body}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.ctrlFill,
              tone === 'muted' ? styles.ctrlFillMuted : styles.ctrlFillGhost,
            ]}>
            {body}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function BrewTimerScreen({ methodId, dose, ratio, onAbort, onComplete }: Props) {
  const method = methodById(methodId);
  const { buzz } = useSettings();

  const waterMl = useMemo(() => waterFor(dose, ratio), [dose, ratio]);
  const steps = useMemo(() => buildSchedule(method, waterMl), [method, waterMl]);
  const totalMs = useMemo(() => totalDuration(steps), [steps]);

  const [confirming, setConfirming] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.88)).current;

  const buzzRef = useRef(buzz);
  buzzRef.current = buzz;
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const handleStepChange = useCallback(() => {
    buzzRef.current([0, 120]);
  }, []);

  const handleComplete = useCallback(() => {
    buzzRef.current([0, 200, 120, 200]);
    const result: BrewResult = {
      methodId: method.id,
      methodName: method.name,
      dose,
      ratio,
      waterMl,
      totalMs,
      finishedAt: Date.now(),
    };
    Animated.timing(fade, {
      toValue: 0,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => completeRef.current(result));
  }, [dose, fade, method.id, method.name, ratio, totalMs, waterMl]);

  const timer = useBrewTimer(steps, {
    autoStart: true,
    onStepChange: handleStepChange,
    onComplete: handleComplete,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: SCREEN_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(ringScale, {
        toValue: 1,
        tension: 42,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, ringScale]);

  const toggle = timer.toggle;
  const skip = timer.skipStep;

  const handleToggle = useCallback(() => {
    buzzRef.current(10);
    toggle();
  }, [toggle]);

  const handleSkip = useCallback(() => {
    buzzRef.current(14);
    skip();
  }, [skip]);

  const askAbort = useCallback(() => setConfirming(true), []);
  const cancelAbort = useCallback(() => setConfirming(false), []);

  const step = timer.step;
  const stepColor = step ? step.color : theme.colors.primary;
  const nextStep = steps[timer.index + 1];
  const nextLabel = nextStep
    ? 'NEXT: ' + nextStep.phase + ' · ' + Math.round(nextStep.durationMs / 1000) + ' S'
    : 'NEXT: ENJOY';

  const pouring = step ? step.verb === 'POUR TO' : false;

  return (
    <ScreenShell overlay={theme.gradients.brewOverlay}>
      <Animated.View pointerEvents="box-none" style={[styles.root, { opacity: fade }]}>
        <AppHeader
          dark
          title={method.name}
          onBack={askAbort}
          rightSlot={
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                {'STEP ' + (timer.index + 1) + '/' + steps.length}
              </Text>
            </View>
          }
        />

        <View style={styles.area}>
          <Animated.View
            pointerEvents="none"
            style={[styles.ringSlot, { transform: [{ scale: ringScale }] }]}>
            <BrewRing
              stepProgress={timer.stepProgress}
              totalProgress={timer.totalProgress}
              color={stepColor}
              phase={step ? step.phase : 'READY'}
              verb={step ? step.verb : 'POUR TO'}
              targetG={step ? step.targetG : 0}
              remainingMs={timer.stepRemainingMs}
              paused={!timer.running && !timer.done}
              pulsing={pouring && timer.running}
            />
          </Animated.View>

          <View style={styles.preview}>
            <Text style={styles.previewText} numberOfLines={1}>
              {nextLabel}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHairline} />

          <StatRow>
            <StatSlot>
              <StatPill
                dark
                Icon={Hourglass}
                value={mmss(timer.elapsedMs)}
                label="ELAPSED"
                accent={theme.colors.mustard}
              />
            </StatSlot>
            <StatSlot>
              <StatPill
                dark
                Icon={Droplet}
                value={(step ? step.targetG : 0) + ' G'}
                label="WATER"
                accent={theme.colors.secondary}
              />
            </StatSlot>
            <StatSlot>
              <StatPill
                dark
                Icon={ListOrdered}
                value={timer.index + 1 + '/' + steps.length}
                label="STEP"
                accent={theme.colors.primary}
              />
            </StatSlot>
          </StatRow>

          {confirming ? (
            <View style={styles.confirmRow}>
              <Text style={styles.confirmText}>END BREW?</Text>
              <View style={styles.confirmBtns}>
                <ControlButton
                  label="KEEP"
                  Icon={Play}
                  onPress={cancelAbort}
                  tone="ghost"
                  flex={1}
                />
                <ControlButton
                  label="END"
                  Icon={SkipForward}
                  onPress={onAbort}
                  tone="copper"
                  flex={1}
                />
              </View>
            </View>
          ) : (
            <View style={styles.controls}>
              <ControlButton
                label={timer.running ? 'PAUSE' : 'RESUME'}
                Icon={timer.running ? Pause : Play}
                onPress={handleToggle}
                tone={timer.running ? 'muted' : 'copper'}
                flex={2}
              />
              <ControlButton
                label="SKIP STEP"
                Icon={SkipForward}
                onPress={handleSkip}
                tone="ghost"
                flex={1}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stepPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(217,123,77,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: theme.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  ringSlot: { alignItems: 'center', justifyContent: 'center' },
  preview: {
    height: 42,
    marginTop: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(250,245,236,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(250,245,236,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: 'rgba(250,245,236,0.66)',
  },
  panel: {
    width: '100%',
    maxWidth: CARD_MAX_W + 32,
    alignSelf: 'center',
    backgroundColor: 'rgba(26,36,24,0.55)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(217,123,77,0.32)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  panelHairline: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: theme.colors.hairline,
  },
  controls: { flexDirection: 'row', gap: 10, marginTop: 12 },
  confirmRow: { marginTop: 12 },
  confirmText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.mustard,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  ctrlPress: { height: 56 },
  ctrlWrap: { width: '100%', height: 56, borderRadius: 16 },
  ctrlFill: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  ctrlFillCopper: { borderColor: 'rgba(255,230,210,0.45)' },
  ctrlFillMuted: {
    backgroundColor: 'rgba(250,245,236,0.14)',
    borderColor: 'rgba(250,245,236,0.26)',
  },
  ctrlFillGhost: {
    backgroundColor: 'rgba(250,245,236,0.08)',
    borderColor: 'rgba(250,245,236,0.20)',
  },
  ctrlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctrlLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1.2, lineHeight: 24 },
});

export default BrewTimerScreen;
