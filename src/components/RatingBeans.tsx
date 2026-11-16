import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { MAX_RATING, SPRING_BUTTON } from '../constants/config';

type Props = { value: number; onChange: (next: number) => void };

const HIT = { top: 8, bottom: 8, left: 4, right: 4 };
const BEANS = [1, 2, 3, 4, 5];

function Bean({
  index,
  filled,
  onPress,
}: {
  index: number;
  filled: boolean;
  onPress: (index: number) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handle = useCallback(() => {
    scale.setValue(1.35);
    Animated.spring(scale, { toValue: 1, ...SPRING_BUTTON }).start();
    onPress(index);
  }, [index, onPress, scale]);

  return (
    <Pressable
      onPress={handle}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={'Rate ' + index + ' of ' + MAX_RATING}
      style={styles.press}>
      <Animated.View style={[styles.beanWrap, { transform: [{ scale }] }]}>
        <Text style={[styles.bean, filled ? styles.beanOn : styles.beanOff]}>{'★'}</Text>
      </Animated.View>
    </Pressable>
  );
}

function RatingBeansBase({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {BEANS.map(i => (
        <Bean key={i} index={i} filled={i <= value} onPress={onChange} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  press: { width: 46, height: 44 },
  beanWrap: { width: 46, height: 44, alignItems: 'center', justifyContent: 'center' },
  bean: { fontSize: 30, lineHeight: 36 },
  beanOn: { color: theme.colors.primary },
  beanOff: { color: 'rgba(26,36,24,0.18)' },
});

export const RatingBeans = React.memo(RatingBeansBase);
export default RatingBeans;
