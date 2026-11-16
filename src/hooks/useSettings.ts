import { useCallback, useSyncExternalStore } from 'react';
import { Vibration } from 'react-native';

export type Units = 'grams' | 'ounces';

type SettingsState = {
  units: Units;
  vibration: boolean;
  preWarnSec: 0 | 3 | 5;
  keepAwake: boolean;
};

let state: SettingsState = {
  units: 'grams',
  vibration: true,
  preWarnSec: 3,
  keepAwake: true,
};

const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  return state;
}

function patch(next: Partial<SettingsState>) {
  state = { ...state, ...next };
  listeners.forEach(fn => fn());
}

export const settingsStore = {
  setUnits: (units: Units) => patch({ units }),
  setVibration: (vibration: boolean) => patch({ vibration }),
  setPreWarn: (preWarnSec: 0 | 3 | 5) => patch({ preWarnSec }),
  setKeepAwake: (keepAwake: boolean) => patch({ keepAwake }),
};

export function useSettings() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  /** No-ops when the user turned the cues off. Needs android.permission.VIBRATE. */
  const buzz = useCallback(
    (pattern: number | number[]) => {
      if (!state.vibration) {
        return;
      }
      try {
        Vibration.vibrate(pattern);
      } catch (e) {
        // a device without a vibrator must never take the app down
      }
    },
    [],
  );

  return { ...value, ...settingsStore, buzz };
}

export function useUnits(): Units {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).units;
}
