import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { dateLabel, mmss, ratioLabel, stars } from '../utils/format';
import { MAX_RATING } from '../constants/config';
import type { LogEntry } from '../hooks/useBrewStore';

function LogRowBase({ entry }: { entry: LogEntry }) {
  const filled = entry.rating;
  const empty = MAX_RATING - filled;

  return (
    <View style={styles.row}>
      <View style={styles.edge} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.date}>{dateLabel(entry.at)}</Text>
          <Text style={styles.rating} numberOfLines={1}>
            <Text style={styles.ratingOn}>{stars(filled)}</Text>
            <Text style={styles.ratingOff}>{stars(empty)}</Text>
          </Text>
        </View>
        <Text style={styles.method} numberOfLines={1}>
          {entry.methodName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {entry.dose +
            ' G · ' +
            ratioLabel(entry.ratio) +
            ' · ' +
            entry.waterMl +
            ' ML · ' +
            mmss(entry.totalMs)}
        </Text>
        <Text style={styles.note} numberOfLines={1}>
          {entry.note ? entry.note : 'NO NOTE'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    padding: 12,
    ...theme.shadows.card,
  },
  edge: {
    width: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginRight: 12,
  },
  body: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: theme.colors.textSecondary },
  rating: { fontSize: 14, letterSpacing: 1 },
  ratingOn: { color: theme.colors.primary },
  ratingOff: { color: 'rgba(26,36,24,0.18)' },
  method: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  meta: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.primaryDeep,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  note: { fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary, marginTop: 3 },
});

export const LogRow = React.memo(LogRowBase);
export default LogRow;
