import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Coffee, FileText, NotebookPen, Play, Settings } from 'lucide-react-native';
import theme from '../constants/theme';
import {
  MENU_ART_H,
  MENU_SPRITE,
  MENU_SPRITE_BOTTOM,
  SHEET_OVERLAP,
} from '../constants/config';
import assets from '../assets';
import { METHODS, methodById } from '../game/methods';
import type { MethodId } from '../game/methods';
import { useTotalBrews } from '../hooks/useBrewStore';
import MethodChip from '../components/MethodChip';
import MethodCard from '../components/MethodCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

type Props = {
  methodId: MethodId;
  onSelectMethod: (id: MethodId) => void;
  onStart: () => void;
  onOpenLog: () => void;
  onOpenRecipes: () => void;
  onOpenSettings: () => void;
};

export function MenuScreen({
  methodId,
  onSelectMethod,
  onStart,
  onOpenLog,
  onOpenRecipes,
  onOpenSettings,
}: Props) {
  const totalBrews = useTotalBrews();
  const method = methodById(methodId);

  const sheetShift = useRef(new Animated.Value(40)).current;
  const sheetFade = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(0.94)).current;
  const kettle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sheetShift, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetFade, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();

    Animated.spring(ctaScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: 240,
      useNativeDriver: true,
    }).start();

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(kettle, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(kettle, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    float.start();
    return () => float.stop();
  }, [ctaScale, kettle, sheetFade, sheetShift]);

  const kettleShift = kettle.interpolate({ inputRange: [0, 1], outputRange: [7, -7] });
  const beansShift = kettle.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <View style={styles.root}>
      <View style={styles.art}>
        <ImageBackground source={assets.bg} resizeMode="cover" style={styles.artImage}>
          <LinearGradient
            colors={theme.gradients.menuFade}
            locations={[0, 0.62, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="box-none" style={styles.badgeRow}>
            <View style={styles.badge}>
              <Coffee size={16} color={theme.colors.textOnDark} strokeWidth={2.4} />
              <Text style={styles.badgeText}>{totalBrews + ' BREWS'}</Text>
            </View>
          </View>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Animated.Image
              source={assets.sprite5}
              style={[styles.beans, { transform: [{ translateY: beansShift }] }]}
            />
            <Animated.Image
              source={assets.sprite4}
              style={[styles.kettle, { transform: [{ translateY: kettleShift }] }]}
            />
          </View>
        </ImageBackground>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.sheet,
          { opacity: sheetFade, transform: [{ translateY: sheetShift }] },
        ]}>
        <Text style={styles.title}>COFFEE BREW TIMER</Text>
        <Text style={styles.tagline}>{'PICK A METHOD · DIAL THE DOSE'}</Text>

        <View style={styles.chipRow}>
          {METHODS.map(m => (
            <View key={m.id} style={styles.chipSlot}>
              <MethodChip
                label={m.chip}
                active={m.id === methodId}
                onPress={() => onSelectMethod(m.id)}
              />
            </View>
          ))}
        </View>

        <View style={styles.cardSlot}>
          <MethodCard method={method} />
        </View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.ctaSlot, { transform: [{ scale: ctaScale }] }]}>
          <PrimaryButton label="START BREWING" onPress={onStart} Icon={Play} />
        </Animated.View>

        <View style={styles.secondaryRow}>
          <View style={styles.secondarySlot}>
            <SecondaryButton label="BREW LOG" onPress={onOpenLog} Icon={FileText} />
          </View>
          <View style={styles.secondarySlot}>
            <SecondaryButton label="RECIPES" onPress={onOpenRecipes} Icon={NotebookPen} />
          </View>
          <View style={styles.gearSlot}>
            <SecondaryButton
              label=""
              a11yLabel="Settings"
              onPress={onOpenSettings}
              Icon={Settings}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  art: { height: MENU_ART_H },
  artImage: { flex: 1, backgroundColor: '#2B2018' },
  badgeRow: {
    paddingTop: 44,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(26,36,24,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.5)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 16,
    color: theme.colors.textOnDark,
  },
  kettle: {
    position: 'absolute',
    right: 20,
    bottom: MENU_SPRITE_BOTTOM,
    width: MENU_SPRITE,
    height: MENU_SPRITE,
    resizeMode: 'contain',
  },
  beans: {
    position: 'absolute',
    left: 18,
    bottom: MENU_SPRITE_BOTTOM + 6,
    width: Math.round(MENU_SPRITE * 0.74),
    height: Math.round(MENU_SPRITE * 0.74),
    resizeMode: 'contain',
    opacity: 0.95,
  },
  sheet: {
    flex: 1,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    borderTopWidth: 2,
    borderTopColor: 'rgba(217,123,77,0.35)',
    paddingHorizontal: 20,
    paddingTop: 16,
    ...theme.shadows.sheet,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textPrimary,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  chipRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  chipSlot: { flex: 1 },
  cardSlot: { marginTop: 12 },
  ctaSlot: { marginTop: 14 },
  secondaryRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 14 },
  secondarySlot: { flex: 1 },
  gearSlot: { width: 48 },
});

export default MenuScreen;
