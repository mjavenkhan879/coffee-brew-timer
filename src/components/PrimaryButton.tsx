import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';
import { BUTTON_H, ICON_SIZE, SPRING_BUTTON } from '../constants/config';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  variant?: 'copper' | 'sage';
  disabled?: boolean;
  height?: number;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * Pressable OUTSIDE, Animated.View INSIDE — the inverse eats onPress on Android
 * release builds. Icon is a fixed 24x24 square and the label's lineHeight matches it.
 */
export function PrimaryButton({
  label,
  onPress,
  Icon,
  variant = 'copper',
  disabled,
  height = BUTTON_H,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const down = useCallback(() => {
    Animated.spring(scale, { toValue: 0.95, ...SPRING_BUTTON }).start();
  }, [scale]);

  const up = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...SPRING_BUTTON }).start();
  }, [scale]);

  const colors = variant === 'sage' ? theme.gradients.ctaSage : theme.gradients.cta;
  const shadow = variant === 'sage' ? theme.shadows.ctaSage : theme.shadows.cta;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={down}
      onPressOut={up}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.press, { height }, disabled ? styles.disabled : null]}>
      <Animated.View style={[styles.wrap, shadow, { height, transform: [{ scale }] }]}>
        <LinearGradient
          colors={colors}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.fill, { height }]}>
          <View style={styles.row}>
            {Icon ? <Icon size={ICON_SIZE} color="#FFF6EC" strokeWidth={2.6} /> : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  disabled: { opacity: 0.45 },
  wrap: { width: '100%', borderRadius: 18, overflow: 'visible' },
  fill: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,230,210,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: ICON_SIZE,
    color: '#FFF6EC',
  },
});

export default React.memo(PrimaryButton);
