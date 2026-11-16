import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CheckCircle2, Droplet, Hourglass, RotateCcw, Scale } from 'lucide-react-native';
import theme from '../constants/theme';
import { CARD_MAX_W, SPRING_HERO } from '../constants/config';
import ScreenShell from '../components/ScreenShell';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import RatingBeans from '../components/RatingBeans';
import { StatPill, StatRow, StatSlot } from '../components/StatPill';
import { brewStore } from '../hooks/useBrewStore';
import { useSettings } from '../hooks/useSettings';
import { mmss, ratioLabel, waterLabel } from '../utils/format';
import type { BrewResult } from '../game/brewEngine';

type Props = {
  result: BrewResult;
  onBrewAgain: () => void;
  onMenu: () => void;
  onOpenLog: () => void;
};

const NOTES = ['BRIGHT', 'BALANCED', 'BITTER'];
const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function Ripple({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ripple, { opacity, transform: [{ scale }] }]}
    />
  );
}

function NoteChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: (label: string) => void;
}) {
  const handle = useCallback(() => onPress(label), [label, onPress]);

  return (
    <Pressable
      onPress={handle}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={styles.notePress}>
      <View style={[styles.noteChip, active ? styles.noteChipOn : styles.noteChipOff]}>
        <Text style={[styles.noteText, active ? styles.noteTextOn : styles.noteTextOff]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function BrewSummaryScreen({ result, onBrewAgain, onMenu, onOpenLog }: Props) {
  const { units, buzz } = useSettings();
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('BALANCED');
  const [text, setText] = useState('');

  const hero = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const savedRef = useRef(false);
  const stateRef = useRef({ rating, note, text });
  stateRef.current = { rating, note, text };

  useEffect(() => {
    Animated.spring(hero, { toValue: 1, ...SPRING_HERO }).start();
    Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [fade, hero]);

  const save = useCallback(() => {
    if (savedRef.current) {
      return;
    }
    savedRef.current = true;
    const live = stateRef.current;
    const extra = live.text.trim();
    brewStore.addLogEntry({
      methodId: result.methodId,
      methodName: result.methodName,
      dose: result.dose,
      ratio: result.ratio,
      waterMl: result.waterMl,
      totalMs: result.totalMs,
      rating: live.rating,
      note: extra ? live.note + ' · ' + extra.toUpperCase() : live.note,
      at: result.finishedAt,
    });
  }, [result]);

  const rate = useCallback(
    (next: number) => {
      buzz(10);
      setRating(next);
    },
    [buzz],
  );

  const pickNote = useCallback(
    (next: string) => {
      buzz(10);
      setNote(next);
    },
    [buzz],
  );

  const again = useCallback(() => {
    save();
    onBrewAgain();
  }, [onBrewAgain, save]);

  const toLog = useCallback(() => {
    save();
    onOpenLog();
  }, [onOpenLog, save]);

  const toMenu = useCallback(() => {
    save();
    onMenu();
  }, [onMenu, save]);

  return (
    <ScreenShell overlay={theme.gradients.resultOverlay} locations={[0, 0.5, 1]}>
      <Animated.View pointerEvents="box-none" style={[styles.root, { opacity: fade }]}>
        <View style={styles.heroBlock}>
          <Ripple delay={0} />
          <Ripple delay={160} />
          <Ripple delay={320} />
          <Animated.View
            pointerEvents="none"
            style={[styles.medallion, { transform: [{ scale: hero }] }]}>
            <CheckCircle2 size={48} color={theme.colors.success} strokeWidth={2.4} />
          </Animated.View>
        </View>

        <View style={styles.headRow}>
          <View style={styles.rule} />
          <Text style={styles.headline}>BREW COMPLETE</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.method} numberOfLines={1}>
          {result.methodName}
        </Text>

        <View style={styles.statSlotWrap}>
          <StatRow>
            <StatSlot>
              <StatPill
                Icon={Hourglass}
                value={mmss(result.totalMs)}
                label="TOTAL"
                accent={theme.colors.primary}
              />
            </StatSlot>
            <StatSlot>
              <StatPill
                Icon={Droplet}
                value={waterLabel(result.waterMl, units)}
                label="WATER"
                accent={theme.colors.secondary}
              />
            </StatSlot>
            <StatSlot>
              <StatPill
                Icon={Scale}
                value={ratioLabel(result.ratio)}
                label="RATIO"
                accent={theme.colors.mustard}
              />
            </StatSlot>
          </StatRow>
        </View>

        <Text style={styles.caption}>RATE THIS CUP</Text>
        <RatingBeans value={rating} onChange={rate} />

        <View style={styles.noteRow}>
          {NOTES.map(n => (
            <NoteChip key={n} label={n} active={n === note} onPress={pickNote} />
          ))}
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a note…"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={60}
          style={styles.input}
          accessibilityLabel="Taste note"
        />

        <View style={styles.ctaSlot}>
          <PrimaryButton label="BREW AGAIN" onPress={again} Icon={RotateCcw} height={56} />
        </View>

        <View style={styles.secondaryRow}>
          <View style={styles.secondarySlot}>
            <SecondaryButton label="SAVE TO LOG" onPress={toLog} height={46} />
          </View>
          <View style={styles.secondarySlot}>
            <SecondaryButton label="BACK TO METHODS" onPress={toMenu} height={46} />
          </View>
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: CARD_MAX_W,
    alignSelf: 'center',
    paddingTop: 44,
    paddingBottom: 14,
  },
  heroBlock: { height: 94, alignItems: 'center', justifyContent: 'center' },
  ripple: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
  medallion: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.bg,
    borderWidth: 2,
    borderColor: 'rgba(60,171,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  rule: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 12,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: theme.colors.textPrimary,
  },
  method: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statSlotWrap: { marginTop: 12 },
  caption: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 2,
  },
  noteRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  notePress: { flex: 1, height: 44 },
  noteChip: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteChipOn: {
    backgroundColor: 'rgba(217,123,77,0.18)',
    borderColor: theme.colors.primary,
  },
  noteChipOff: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  noteText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  noteTextOn: { color: theme.colors.primaryDeep },
  noteTextOff: { color: theme.colors.textSecondary },
  input: {
    height: 46,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  ctaSlot: { marginTop: 10 },
  secondaryRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  secondarySlot: { flex: 1 },
});

export default BrewSummaryScreen;
