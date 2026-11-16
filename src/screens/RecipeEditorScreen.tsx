import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, NotebookPen, Plus, Trash2 } from 'lucide-react-native';
import theme from '../constants/theme';
import {
  CARD_MAX_W,
  DOSE_BIG_STEP,
  DOSE_MAX,
  DOSE_MIN,
  DOSE_STEP,
  RATIO_MAX,
  RATIO_MIN,
  RATIO_STEP,
} from '../constants/config';
import assets from '../assets';
import ScreenShell from '../components/ScreenShell';
import AppHeader from '../components/AppHeader';
import Stepper from '../components/Stepper';
import MethodChip from '../components/MethodChip';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { METHODS, methodById } from '../game/methods';
import type { MethodId } from '../game/methods';
import { brewStore, useRecipes } from '../hooks/useBrewStore';
import type { Recipe } from '../hooks/useBrewStore';
import { useSettings } from '../hooks/useSettings';
import { mmss, ratioLabel } from '../utils/format';

type Props = { onBack: () => void };

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

function totalFor(methodId: MethodId): number {
  return methodById(methodId).steps.reduce((sum, s) => sum + s.durationMs, 0);
}

function RecipeCard({
  recipe,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}) {
  const edit = useCallback(() => onEdit(recipe), [onEdit, recipe]);
  const remove = useCallback(() => onDelete(recipe.id), [onDelete, recipe.id]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHairline} />
      <Image source={assets[methodById(recipe.methodId).sprite]} style={styles.cardSprite} />
      <View style={styles.cardText}>
        <Text style={styles.cardName} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{methodById(recipe.methodId).chip}</Text>
          </View>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {recipe.dose +
              ' G · ' +
              ratioLabel(recipe.ratio) +
              ' · ' +
              mmss(recipe.totalMs)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={edit}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={'Edit ' + recipe.name}
        style={styles.iconBtn}>
        <NotebookPen size={20} color={theme.colors.primaryDeep} strokeWidth={2.4} />
      </Pressable>
      <Pressable
        onPress={remove}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={'Delete ' + recipe.name}
        style={[styles.iconBtn, styles.iconBtnDanger]}>
        <Trash2 size={20} color={theme.colors.walnut} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

export function RecipeEditorScreen({ onBack }: Props) {
  const recipes = useRecipes();
  const { buzz } = useSettings();

  const [draft, setDraft] = useState<Recipe | null>(null);
  const [name, setName] = useState('');
  const [methodId, setMethodId] = useState<MethodId>('v60');
  const [dose, setDose] = useState(18);
  const [ratio, setRatio] = useState(15);
  const [saved, setSaved] = useState(false);

  const savedFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!saved) {
      return;
    }
    savedFade.setValue(0);
    Animated.sequence([
      Animated.timing(savedFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(savedFade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setSaved(false));
  }, [saved, savedFade]);

  const openNew = useCallback(() => {
    setDraft({ id: '', name: '', methodId: 'v60', dose: 18, ratio: 15, totalMs: totalFor('v60') });
    setName('NEW RECIPE');
    setMethodId('v60');
    setDose(18);
    setRatio(15);
  }, []);

  const openEdit = useCallback((recipe: Recipe) => {
    setDraft(recipe);
    setName(recipe.name);
    setMethodId(recipe.methodId);
    setDose(recipe.dose);
    setRatio(recipe.ratio);
  }, []);

  const closeEditor = useCallback(() => setDraft(null), []);

  const remove = useCallback(
    (id: string) => {
      buzz(14);
      brewStore.deleteRecipe(id);
    },
    [buzz],
  );

  const tick = useCallback(() => buzz(12), [buzz]);

  const save = useCallback(() => {
    if (!draft) {
      return;
    }
    buzz(18);
    brewStore.saveRecipe({
      id: draft.id,
      name: name.trim() ? name.trim().toUpperCase() : 'UNTITLED',
      methodId,
      dose,
      ratio,
      totalMs: totalFor(methodId),
    });
    setSaved(true);
    setDraft(null);
  }, [buzz, dose, draft, methodId, name, ratio]);

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeCard recipe={item} onEdit={openEdit} onDelete={remove} />
    ),
    [openEdit, remove],
  );

  return (
    <ScreenShell overlay={theme.gradients.panelOverlay}>
      <AppHeader
        title={draft ? 'EDIT RECIPE' : 'RECIPES'}
        onBack={draft ? closeEditor : onBack}
        rightSlot={
          draft ? null : (
            <Pressable
              onPress={openNew}
              hitSlop={HIT}
              accessibilityRole="button"
              accessibilityLabel="New recipe"
              style={styles.addBtn}>
              <Plus size={22} color={theme.colors.primaryDeep} strokeWidth={2.8} />
            </Pressable>
          )
        }
      />

      <View style={styles.body}>
        {draft ? (
          <View style={styles.editor}>
            <Text style={styles.label}>RECIPE NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name this brew…"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={24}
              style={styles.input}
              accessibilityLabel="Recipe name"
            />

            <Text style={styles.label}>METHOD</Text>
            <View style={styles.chipRow}>
              {METHODS.map(m => (
                <View key={m.id} style={styles.chipSlot}>
                  <MethodChip
                    label={m.chip}
                    active={m.id === methodId}
                    onPress={() => setMethodId(m.id)}
                  />
                </View>
              ))}
            </View>

            <View style={styles.gap} />
            <Stepper
              label="COFFEE DOSE"
              value={dose}
              min={DOSE_MIN}
              max={DOSE_MAX}
              step={DOSE_STEP}
              bigStep={DOSE_BIG_STEP}
              format={v => v + ' g'}
              onChange={setDose}
              onTick={tick}
              valueSize={34}
            />

            <View style={styles.gap} />
            <Stepper
              label="BREW RATIO"
              value={ratio}
              min={RATIO_MIN}
              max={RATIO_MAX}
              step={RATIO_STEP}
              format={ratioLabel}
              onChange={setRatio}
              onTick={tick}
              valueSize={30}
              accent={theme.colors.mustard}
            />

            <View style={styles.editorCta}>
              <PrimaryButton label="SAVE RECIPE" onPress={save} Icon={Check} height={56} />
            </View>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            contentContainerStyle={styles.listPad}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            windowSize={5}
            ListFooterComponent={
              <View style={styles.footer}>
                <SecondaryButton label="NEW RECIPE" onPress={openNew} Icon={Plus} />
              </View>
            }
          />
        )}
      </View>

      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: savedFade }]}>
        <Check size={18} color={theme.colors.success} strokeWidth={3} />
        <Text style={styles.toastText}>SAVED</Text>
      </Animated.View>
    </ScreenShell>
  );
}

function Separator() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  body: { flex: 1, width: CARD_MAX_W, alignSelf: 'center' },
  listPad: { paddingTop: 14, paddingBottom: 24 },
  sep: { height: 10 },
  footer: { marginTop: 14 },
  editor: { flex: 1, paddingTop: 12 },
  gap: { height: 10 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  chipRow: { flexDirection: 'row', gap: 10 },
  chipSlot: { flex: 1 },
  editorCta: { marginTop: 'auto', marginBottom: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 12,
    paddingHorizontal: 12,
    ...theme.shadows.card,
  },
  cardHairline: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: theme.colors.hairline,
  },
  cardSprite: { width: 42, height: 42, resizeMode: 'contain', marginRight: 10 },
  cardText: { flex: 1, marginRight: 8 },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.textPrimary,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  badge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(217,123,77,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 13,
    color: theme.colors.primaryDeep,
  },
  cardMeta: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217,123,77,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.32)',
    marginLeft: 8,
  },
  iconBtnDanger: {
    backgroundColor: 'rgba(107,87,64,0.10)',
    borderColor: 'rgba(107,87,64,0.30)',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217,123,77,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217,123,77,0.34)',
  },
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 18,
    color: theme.colors.success,
  },
});

export default RecipeEditorScreen;
