import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';
import { SPRING_BUTTON } from '../constants/config';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function MethodChipBase({ label, active, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const down = useCallback(() => {
    Animated.spring(scale, { toValue: 0.95, ...SPRING_BUTTON }).start();
  }, [scale]);

  const up = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...SPRING_BUTTON }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={down}
      onPressOut={up}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={styles.press}>
      <Animated.View style={[styles.wrap, active ? theme.shadows.cta : null, { transform: [{ scale }] }]}>
        {active ? (
          <LinearGradient
            colors={theme.gradients.chipActive}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fill, styles.fillActive]}>
            <Text numberOfLines={1} style={[styles.label, styles.labelActive]}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          <Animated.View style={[styles.fill, styles.fillIdle]}>
            <Text numberOfLines={1} style={[styles.label, styles.labelIdle]}>
              {label}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 48 },
  wrap: { width: '100%', height: 48, borderRadius: 16 },
  fill: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fillActive: { borderWidth: 2, borderColor: '#B4552C' },
  fillIdle: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceAlt,
  },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  labelActive: { color: '#FFF6EC' },
  labelIdle: { color: '#6B5E4A' },
});

export const MethodChip = React.memo(MethodChipBase);
export default MethodChip;
