import { useSyncExternalStore } from 'react';
import type { MethodId } from '../game/methods';

export type LogEntry = {
  id: string;
  methodId: MethodId;
  methodName: string;
  dose: number;
  ratio: number;
  waterMl: number;
  totalMs: number;
  rating: number;
  note: string;
  at: number;
};

export type Recipe = {
  id: string;
  name: string;
  methodId: MethodId;
  dose: number;
  ratio: number;
  totalMs: number;
};

type State = {
  log: LogEntry[];
  recipes: Recipe[];
};

const DAY = 86400000;
const now = Date.now();

let state: State = {
  log: [
    { id: 'l1', methodId: 'v60', methodName: 'V60 POUR-OVER', dose: 18, ratio: 15, waterMl: 270, totalMs: 180000, rating: 5, note: 'BRIGHT', at: now - DAY },
    { id: 'l2', methodId: 'french', methodName: 'FRENCH PRESS', dose: 30, ratio: 15, waterMl: 450, totalMs: 270000, rating: 4, note: 'BALANCED', at: now - 2 * DAY },
    { id: 'l3', methodId: 'aeropress', methodName: 'AEROPRESS', dose: 15, ratio: 14, waterMl: 210, totalMs: 130000, rating: 4, note: 'BRIGHT', at: now - 4 * DAY },
    { id: 'l4', methodId: 'v60', methodName: 'V60 POUR-OVER', dose: 20, ratio: 16, waterMl: 320, totalMs: 180000, rating: 3, note: 'BITTER', at: now - 6 * DAY },
  ],
  recipes: [
    { id: 'r1', name: 'MORNING V60', methodId: 'v60', dose: 18, ratio: 15, totalMs: 180000 },
    { id: 'r2', name: 'SUNDAY PRESS', methodId: 'french', dose: 30, ratio: 15, totalMs: 270000 },
    { id: 'r3', name: 'DESK AEROPRESS', methodId: 'aeropress', dose: 15, ratio: 14, totalMs: 130000 },
  ],
};

const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  listeners.forEach(fn => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getLog() {
  return state.log;
}

function getRecipes() {
  return state.recipes;
}

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return prefix + '_' + Date.now() + '_' + seq;
}

export const brewStore = {
  addLogEntry(entry: Omit<LogEntry, 'id'>) {
    emit({ ...state, log: [{ ...entry, id: nextId('l') }, ...state.log] });
  },
  saveRecipe(recipe: Recipe) {
    const exists = state.recipes.some(r => r.id === recipe.id);
    const recipes = exists
      ? state.recipes.map(r => (r.id === recipe.id ? recipe : r))
      : [...state.recipes, { ...recipe, id: nextId('r') }];
    emit({ ...state, recipes });
  },
  deleteRecipe(id: string) {
    emit({ ...state, recipes: state.recipes.filter(r => r.id !== id) });
  },
};

/* Individual selectors — a screen subscribes only to the slice it draws (rule: react-state-minimize). */
export function useBrewLog(): LogEntry[] {
  return useSyncExternalStore(subscribe, getLog, getLog);
}

export function useRecipes(): Recipe[] {
  return useSyncExternalStore(subscribe, getRecipes, getRecipes);
}

export function useTotalBrews(): number {
  return useSyncExternalStore(subscribe, getLog, getLog).length;
}
