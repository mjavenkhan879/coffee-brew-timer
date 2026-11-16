import theme from '../constants/theme';
import type { SpriteKey } from '../assets';

export type PhaseKind = 'pour' | 'wait' | 'press';

export type StepTemplate = {
  /** short label shown on the ring, e.g. BLOOM */
  phase: string;
  /** imperative shown under the countdown, e.g. POUR TO */
  verb: string;
  kind: PhaseKind;
  durationMs: number;
  /** share of the total water that should be in the cup when this step ends */
  fraction: number;
};

export type MethodId = 'v60' | 'french' | 'aeropress';

export type Method = {
  id: MethodId;
  chip: string;
  name: string;
  blurb: string;
  sprite: SpriteKey;
  defaultDose: number;
  defaultRatio: number;
  steps: StepTemplate[];
};

const s = (sec: number) => sec * 1000;

export const PHASE_COLOR: Record<PhaseKind, string> = {
  pour: theme.colors.primary,
  wait: theme.colors.mustard,
  press: theme.colors.secondary,
};

export const METHODS: Method[] = [
  {
    id: 'v60',
    chip: 'V60',
    name: 'V60 POUR-OVER',
    blurb: 'Six gentle pours, bright and clean in the cup.',
    sprite: 'sprite1',
    defaultDose: 18,
    defaultRatio: 15,
    steps: [
      { phase: 'BLOOM', verb: 'POUR TO', kind: 'pour', durationMs: s(45), fraction: 0.148 },
      { phase: 'POUR', verb: 'POUR TO', kind: 'pour', durationMs: s(30), fraction: 0.444 },
      { phase: 'WAIT', verb: 'HOLD AT', kind: 'wait', durationMs: s(15), fraction: 0.444 },
      { phase: 'POUR', verb: 'POUR TO', kind: 'pour', durationMs: s(30), fraction: 0.741 },
      { phase: 'POUR', verb: 'POUR TO', kind: 'pour', durationMs: s(20), fraction: 1 },
      { phase: 'DRAWDOWN', verb: 'LET DRAIN', kind: 'press', durationMs: s(40), fraction: 1 },
    ],
  },
  {
    id: 'french',
    chip: 'FRENCH',
    name: 'FRENCH PRESS',
    blurb: 'One long steep, full body, zero fuss.',
    sprite: 'sprite2',
    defaultDose: 30,
    defaultRatio: 15,
    steps: [
      { phase: 'BLOOM', verb: 'POUR TO', kind: 'pour', durationMs: s(30), fraction: 0.133 },
      { phase: 'FILL', verb: 'POUR TO', kind: 'pour', durationMs: s(30), fraction: 1 },
      { phase: 'STEEP', verb: 'HOLD AT', kind: 'wait', durationMs: s(180), fraction: 1 },
      { phase: 'BREAK CRUST', verb: 'STIR AT', kind: 'wait', durationMs: s(15), fraction: 1 },
      { phase: 'PLUNGE', verb: 'PRESS AT', kind: 'press', durationMs: s(15), fraction: 1 },
    ],
  },
  {
    id: 'aeropress',
    chip: 'AEROPRESS',
    name: 'AEROPRESS',
    blurb: 'Short steep, firm press, syrupy and sweet.',
    sprite: 'sprite3',
    defaultDose: 15,
    defaultRatio: 14,
    steps: [
      { phase: 'BLOOM', verb: 'POUR TO', kind: 'pour', durationMs: s(30), fraction: 0.238 },
      { phase: 'FILL', verb: 'POUR TO', kind: 'pour', durationMs: s(15), fraction: 1 },
      { phase: 'STEEP', verb: 'HOLD AT', kind: 'wait', durationMs: s(60), fraction: 1 },
      { phase: 'STIR & CAP', verb: 'STIR AT', kind: 'wait', durationMs: s(10), fraction: 1 },
      { phase: 'PRESS', verb: 'PRESS AT', kind: 'press', durationMs: s(15), fraction: 1 },
    ],
  },
];

export function methodById(id: MethodId): Method {
  const found = METHODS.find(m => m.id === id);
  return found ? found : METHODS[0];
}
