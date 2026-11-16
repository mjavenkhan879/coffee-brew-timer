import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BellRing, Scale, ShieldCheck, Sun, Vibrate } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';
import { CARD_MAX_W } from '../constants/config';
import ScreenShell from '../components/ScreenShell';
import AppHeader from '../components/AppHeader';
import Toggle from '../components/Toggle';
import { useSettings } from '../hooks/useSettings';
import type { Units } from '../hooks/useSettings';

type Props = { onBack: () => void };

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const PRE_WARN: Array<0 | 3 | 5> = [0, 3, 5];

function SegChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={styles.segPress}>
      <View style={[styles.seg, active ? styles.segOn : styles.segOff]}>
        <Text style={[styles.segText, active ? styles.segTextOn : styles.segTextOff]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function Row({
  Icon,
  label,
  hint,
  children,
}: {
  Icon: LucideIcon;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHairline} />
      <View style={styles.rowIcon}>
        <Icon size={20} color={theme.colors.primaryDeep} strokeWidth={2.4} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text style={styles.rowHint} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

export function SettingsScreen({ onBack }: Props) {
  const { units, vibration, preWarnSec, keepAwake, setUnits, setVibration, setPreWarn, setKeepAwake, buzz } =
    useSettings();

  const pickUnits = useCallback(
    (next: Units) => {
      buzz(10);
      setUnits(next);
    },
    [buzz, setUnits],
  );

  const toGrams = useCallback(() => pickUnits('grams'), [pickUnits]);
  const toOunces = useCallback(() => pickUnits('ounces'), [pickUnits]);

  const onVibration = useCallback(
    (next: boolean) => {
      setVibration(next);
      if (next) {
        buzz(18);
      }
    },
    [buzz, setVibration],
  );

  return (
    <ScreenShell overlay={theme.gradients.panelOverlay}>
      <AppHeader title="SETTINGS" onBack={onBack} />

      <View style={styles.body}>
        <Row Icon={Scale} label="UNITS" hint="HOW WATER AND DOSE ARE SHOWN">
          <View style={styles.segRow}>
            <SegChip label="G" active={units === 'grams'} onPress={toGrams} />
            <SegChip label="OZ" active={units === 'ounces'} onPress={toOunces} />
          </View>
        </Row>

        <Row Icon={Vibrate} label="VIBRATION CUES" hint="ONE BUZZ ON EVERY STEP">
          <Toggle value={vibration} onChange={onVibration} label="Vibration cues" />
        </Row>

        <Row Icon={BellRing} label="STEP PRE-WARNING" hint="BUZZ BEFORE A STEP ENDS">
          <View style={styles.segRow}>
            {PRE_WARN.map(v => (
              <SegChip
                key={v}
                label={v === 0 ? 'OFF' : v + ' S'}
                active={preWarnSec === v}
                onPress={() => setPreWarn(v)}
              />
            ))}
          </View>
        </Row>

        <Row Icon={Sun} label="KEEP SCREEN AWAKE" hint="WHILE A BREW IS RUNNING">
          <Toggle value={keepAwake} onChange={setKeepAwake} label="Keep screen awake" />
        </Row>

        <View style={styles.about}>
          <View style={styles.aboutIcon}>
            <ShieldCheck size={22} color={theme.colors.secondary} strokeWidth={2.4} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.aboutTitle}>COFFEE BREW TIMER · 1.0</Text>
            <Text style={styles.aboutHint}>{'DATA STAYS ON THIS DEVICE · NO ACCOUNTS'}</Text>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, width: CARD_MAX_W, alignSelf: 'center', paddingTop: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    ...theme.shadows.card,
  },
  rowHairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: theme.colors.hairline,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217,123,77,0.14)',
    marginRight: 10,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textPrimary,
  },
  rowHint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  rowControl: { marginLeft: 8, alignItems: 'flex-end', justifyContent: 'center' },
  segRow: { flexDirection: 'row', gap: 6 },
  segPress: { height: 44, minWidth: 44 },
  seg: {
    height: 44,
    minWidth: 44,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: { backgroundColor: 'rgba(217,123,77,0.20)', borderColor: theme.colors.primary },
  segOff: { backgroundColor: theme.colors.bg, borderColor: theme.colors.border },
  segText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  segTextOn: { color: theme.colors.primaryDeep },
  segTextOff: { color: theme.colors.textSecondary },
  about: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(127,164,107,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(127,164,107,0.35)',
  },
  aboutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127,164,107,0.18)',
    marginRight: 10,
  },
  aboutTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textPrimary,
  },
  aboutHint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
});

export default SettingsScreen;
