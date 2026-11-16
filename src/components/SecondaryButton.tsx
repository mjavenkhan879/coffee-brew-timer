import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';
import { BUTTON_H_SM, ICON_SIZE, SPRING_BUTTON } from '../constants/config';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  dark?: boolean;
  height?: number;
  /** spoken name when the button is icon-only (label === '') */
  a11yLabel?: string;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export function SecondaryButton({
  label,
  onPress,
  Icon,
  dark,
  height = BUTTON_H_SM,
  a11yLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const down = useCallback(() => {
    Animated.spring(scale, { toValue: 0.95, ...SPRING_BUTTON }).start();
  }, [scale]);

  const up = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...SPRING_BUTTON }).start();
  }, [scale]);

  const tint = dark ? theme.colors.textOnDark : theme.colors.primaryDeep;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={down}
      onPressOut={up}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label ? label : a11yLabel}
      style={[styles.press, { height }]}>
      <Animated.View
        style={[
          styles.wrap,
          dark ? styles.wrapDark : styles.wrapLight,
          { height, transform: [{ scale }] },
        ]}>
        <View style={styles.row}>
          {Icon ? <Icon size={ICON_SIZE} color={tint} strokeWidth={2.4} /> : null}
          {label ? (
            <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  wrap: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  wrapLight: {
    backgroundColor: 'rgba(217,123,77,0.10)',
    borderColor: 'rgba(217,123,77,0.32)',
  },
  wrapDark: {
    backgroundColor: 'rgba(250,245,236,0.10)',
    borderColor: 'rgba(250,245,236,0.22)',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { fontSize: 13, fontWeight: '800', letterSpacing: 1.1, lineHeight: ICON_SIZE },
});

export default React.memo(SecondaryButton);
