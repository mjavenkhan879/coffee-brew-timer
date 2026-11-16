import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import theme from '../constants/theme';

type Props = { value: boolean; onChange: (next: boolean) => void; label: string };

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function ToggleBase({ value, onChange, label }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [anim, value]);

  const toggle = useCallback(() => onChange(!value), [onChange, value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 22] });

  return (
    <Pressable
      onPress={toggle}
      hitSlop={HIT}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={styles.press}>
      <Animated.View
        style={[
          styles.track,
          value ? styles.trackOn : styles.trackOff,
        ]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: 54, height: 32 },
  track: {
    width: 54,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: 'rgba(127,164,107,0.35)', borderColor: theme.colors.secondary },
  trackOff: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export const Toggle = React.memo(ToggleBase);
export default Toggle;
