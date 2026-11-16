import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';

type Props = {
  /** per-screen wash — the single thing that tells the screens apart (rule #14) */
  overlay: string[];
  locations?: number[];
  children: React.ReactNode;
  /** optional decor layer drawn between the wash and the content */
  decor?: React.ReactNode;
};

/** The one place every screen's background is composed: art -> wash -> decor -> content. */
export function ScreenShell({ overlay, locations, children, decor }: Props) {
  return (
    <ImageBackground source={assets.bg} resizeMode="cover" style={styles.root}>
      <LinearGradient
        colors={overlay}
        locations={locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {decor ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {decor}
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A2418' },
  content: { flex: 1 },
});

export default ScreenShell;
