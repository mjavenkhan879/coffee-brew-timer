import { PHASE_COLOR } from './methods';
import type { Method, MethodId, StepTemplate } from './methods';

export type BrewStep = {
  index: number;
  phase: string;
  verb: string;
  color: string;
  durationMs: number;
  startMs: number;
  endMs: number;
  targetG: number;
};

export type BrewResult = {
  methodId: MethodId;
  methodName: string;
  dose: number;
  ratio: number;
  waterMl: number;
  totalMs: number;
  finishedAt: number;
};

export function waterFor(dose: number, ratio: number): number {
  return Math.round(dose * ratio);
}

/** Durations are fixed by the method; only the pour targets scale with the dose. */
export function buildSchedule(method: Method, waterMl: number): BrewStep[] {
  let cursor = 0;
  return method.steps.map((t: StepTemplate, index: number) => {
    const startMs = cursor;
    cursor += t.durationMs;
    return {
      index,
      phase: t.phase,
      verb: t.verb,
      color: PHASE_COLOR[t.kind],
      durationMs: t.durationMs,
      startMs,
      endMs: cursor,
      targetG: Math.round(waterMl * t.fraction),
    };
  });
}

export function totalDuration(steps: BrewStep[]): number {
  return steps.length > 0 ? steps[steps.length - 1].endMs : 0;
}

export function stepIndexAt(steps: BrewStep[], elapsedMs: number): number {
  for (let i = 0; i < steps.length; i += 1) {
    if (elapsedMs < steps[i].endMs) {
      return i;
    }
  }
  return steps.length - 1;
}

export function stepProgressAt(step: BrewStep, elapsedMs: number): number {
  if (step.durationMs <= 0) {
    return 1;
  }
  const p = (elapsedMs - step.startMs) / step.durationMs;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
