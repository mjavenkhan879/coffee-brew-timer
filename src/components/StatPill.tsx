import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  value: string;
  label: string;
  /** the semantic colour — the ONLY thing that differs across a row (rule #21) */
  accent: string;
  dark?: boolean;
};

/**
 * The one stat component used on every screen. A row differentiates its pills by
 * colour, value and caption — never by swapping in a different sprite.
 * `width:'100%'` (not flex:1) so it keeps its intrinsic height inside a flex:1 slot.
 */
function StatPillBase({ Icon, value, label, accent, dark }: Props) {
  return (
    <View
      style={[
        styles.card,
        dark ? styles.cardDark : styles.cardLight,
        { borderColor: accent + '55' },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Icon size={18} color={accent} strokeWidth={2.5} />
      </View>
      <Text numberOfLines={1} style={[styles.value, { color: accent }]}>
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.label, { color: dark ? 'rgba(250,245,236,0.6)' : theme.colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cardLight: { backgroundColor: theme.colors.surface },
  cardDark: { backgroundColor: 'rgba(0,0,0,0.26)' },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  label: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.1, marginTop: 2 },
});

export const StatPill = React.memo(StatPillBase);

/** Row wrapper so every pill in a row is the same width/height everywhere. */
export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={rowStyles.row}>{children}</View>;
}

export function StatSlot({ children }: { children: React.ReactNode }) {
  return <View style={rowStyles.slot}>{children}</View>;
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
});

export default StatPill;
