import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { HEADER_CONTENT_H, HEADER_PAD_TOP } from '../constants/config';
import assets from '../assets';

type Props = {
  title: string;
  onBack?: () => void;
  /** right-hand slot — a pill, a count, a button */
  rightSlot?: React.ReactNode;
  /** left-hand slot override; defaults to the back button when onBack is given */
  leftSlot?: React.ReactNode;
  dark?: boolean;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** The single header used by every screen — different slots, identical styling. */
export function AppHeader({ title, onBack, rightSlot, leftSlot, dark }: Props) {
  const left = leftSlot ? (
    leftSlot
  ) : onBack ? (
    <Pressable
      onPress={onBack}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[styles.back, dark ? styles.backDark : styles.backLight]}>
      <Image source={assets.iconHome} style={styles.backIcon} />
    </Pressable>
  ) : (
    <View style={styles.slot} />
  );

  return (
    <View style={[styles.root, dark ? styles.rootDark : styles.rootLight]}>
      <View style={styles.side}>{left}</View>
      <Text
        numberOfLines={1}
        style={[styles.title, { color: dark ? theme.colors.textOnDark : theme.colors.textPrimary }]}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {rightSlot ? rightSlot : <View style={styles.slot} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: HEADER_PAD_TOP + HEADER_CONTENT_H,
    paddingTop: HEADER_PAD_TOP,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rootDark: {
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217,123,77,0.35)',
  },
  rootLight: {
    backgroundColor: 'rgba(242,234,216,0.82)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(217,123,77,0.28)',
  },
  side: { width: 92, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  slot: { width: 44, height: 44 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backLight: {
    backgroundColor: 'rgba(217,123,77,0.12)',
    borderColor: 'rgba(217,123,77,0.34)',
  },
  backDark: {
    backgroundColor: 'rgba(250,245,236,0.10)',
    borderColor: 'rgba(217,123,77,0.40)',
  },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
});

export default AppHeader;
