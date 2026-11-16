import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Clock, Scale, ListOrdered } from 'lucide-react-native';
import theme from '../constants/theme';
import assets from '../assets';
import { StatPill, StatRow, StatSlot } from './StatPill';
import { mmss } from '../utils/format';
import type { Method } from '../game/methods';

type Props = { method: Method };

function MethodCardBase({ method }: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [fade, method.id]);

  const totalMs = method.steps.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <Animated.View pointerEvents="box-none" style={[styles.card, { opacity: fade }]}>
      <View style={styles.hairline} />
      <View style={styles.head}>
        <Image source={assets[method.sprite]} style={styles.sprite} />
        <View style={styles.headText}>
          <Text style={styles.name} numberOfLines={1}>
            {method.name}
          </Text>
          <Text style={styles.blurb} numberOfLines={2}>
            {method.blurb}
          </Text>
        </View>
      </View>
      <StatRow>
        <StatSlot>
          <StatPill Icon={Clock} value={mmss(totalMs)} label="TOTAL" accent={theme.colors.primary} />
        </StatSlot>
        <StatSlot>
          <StatPill
            Icon={Scale}
            value={method.defaultDose + ' G'}
            label="DOSE"
            accent={theme.colors.mustard}
          />
        </StatSlot>
        <StatSlot>
          <StatPill
            Icon={ListOrdered}
            value={String(method.steps.length)}
            label="STEPS"
            accent={theme.colors.secondary}
          />
        </StatSlot>
      </StatRow>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    padding: 13,
    ...theme.shadows.card,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: theme.colors.hairline,
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sprite: { width: 50, height: 50, resizeMode: 'contain', marginRight: 12 },
  headText: { flex: 1 },
  name: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.textPrimary,
  },
  blurb: {
    fontSize: 12.5,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
});

export const MethodCard = React.memo(MethodCardBase);
export default MethodCard;
