import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import theme from '../constants/theme';
import assets from '../assets';
import PrimaryButton from './PrimaryButton';

type Props = {
  title: string;
  hint: string;
  ctaLabel: string;
  onPress: () => void;
};

export function EmptyState({ title, hint, ctaLabel, onPress }: Props) {
  return (
    <View style={styles.root}>
      <Image source={assets.sprite5} style={styles.sprite} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.cta}>
        <PrimaryButton label={ctaLabel} onPress={onPress} Icon={Play} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  sprite: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 14 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: theme.colors.textSecondary,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  cta: { width: '100%', maxWidth: 320 },
});

export default EmptyState;
