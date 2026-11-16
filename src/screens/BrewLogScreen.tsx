import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Coffee } from 'lucide-react-native';
import theme from '../constants/theme';
import { CARD_MAX_W } from '../constants/config';
import ScreenShell from '../components/ScreenShell';
import AppHeader from '../components/AppHeader';
import LogRow from '../components/LogRow';
import EmptyState from '../components/EmptyState';
import { useBrewLog } from '../hooks/useBrewStore';
import type { LogEntry } from '../hooks/useBrewStore';

type Props = { onBack: () => void; onStart: () => void };

const ROW_GAP = 10;

function keyExtractor(item: LogEntry) {
  return item.id;
}

function renderItem({ item }: { item: LogEntry }) {
  return <LogRow entry={item} />;
}

function Separator() {
  return <View style={styles.sep} />;
}

export function BrewLogScreen({ onBack, onStart }: Props) {
  const log = useBrewLog();

  const start = useCallback(() => onStart(), [onStart]);

  return (
    <ScreenShell overlay={theme.gradients.panelOverlay}>
      <AppHeader
        title="BREW LOG"
        onBack={onBack}
        rightSlot={
          <View style={styles.countPill}>
            <Coffee size={14} color={theme.colors.primaryDeep} strokeWidth={2.6} />
            <Text style={styles.countText}>{log.length + ' BREWS'}</Text>
          </View>
        }
      />

      <View style={styles.body}>
        {log.length > 0 ? (
          <FlatList
            data={log}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            contentContainerStyle={styles.listPad}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            windowSize={5}
          />
        ) : (
          <EmptyState
            title="NO BREWS YET"
            hint={'EVERY FINISHED CUP · LANDS HERE'}
            ctaLabel="START BREWING"
            onPress={start}
          />
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, width: CARD_MAX_W, alignSelf: 'center' },
  listPad: { paddingTop: 14, paddingBottom: 24 },
  sep: { height: ROW_GAP },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(217,123,77,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.45)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 14,
    color: theme.colors.primaryDeep,
  },
});

export default BrewLogScreen;
