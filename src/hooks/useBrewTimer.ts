import { useCallback, useEffect, useRef, useState } from 'react';
import { TICK_MS } from '../constants/config';
import { stepIndexAt, stepProgressAt, totalDuration } from '../game/brewEngine';
import type { BrewStep } from '../game/brewEngine';

type Options = {
  onStepChange?: (index: number, step: BrewStep) => void;
  onComplete?: () => void;
  autoStart?: boolean;
};

/**
 * Wall-clock driven brew ticker. Everything a callback reads lives in a ref so the
 * interval never closes over a stale value (rule #8), and the interval is always
 * cleared in the effect teardown.
 */
export function useBrewTimer(steps: BrewStep[], options: Options) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const stepsRef = useRef(steps);
  const optionsRef = useRef(options);
  const accumulatedRef = useRef(0);
  const startedAtRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIndexRef = useRef(0);
  const doneRef = useRef(false);

  stepsRef.current = steps;
  optionsRef.current = options;

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const list = stepsRef.current;
    const total = totalDuration(list);
    const next = accumulatedRef.current + (Date.now() - startedAtRef.current);

    if (next >= total) {
      stopInterval();
      accumulatedRef.current = total;
      doneRef.current = true;
      setElapsedMs(total);
      setRunning(false);
      setDone(true);
      const complete = optionsRef.current.onComplete;
      if (complete) {
        complete();
      }
      return;
    }

    const idx = stepIndexAt(list, next);
    if (idx !== stepIndexRef.current) {
      stepIndexRef.current = idx;
      const changed = optionsRef.current.onStepChange;
      if (changed) {
        changed(idx, list[idx]);
      }
    }
    setElapsedMs(next);
  }, [stopInterval]);

  const start = useCallback(() => {
    if (doneRef.current || intervalRef.current !== null) {
      return;
    }
    startedAtRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(tick, TICK_MS);
  }, [tick]);

  const pause = useCallback(() => {
    if (intervalRef.current === null) {
      return;
    }
    accumulatedRef.current += Date.now() - startedAtRef.current;
    stopInterval();
    setRunning(false);
    setElapsedMs(accumulatedRef.current);
  }, [stopInterval]);

  const toggle = useCallback(() => {
    if (intervalRef.current !== null) {
      pause();
    } else {
      start();
    }
  }, [pause, start]);

  const skipStep = useCallback(() => {
    const list = stepsRef.current;
    if (doneRef.current || list.length === 0) {
      return;
    }
    const wasRunning = intervalRef.current !== null;
    stopInterval();

    const current = stepIndexAt(list, accumulatedRef.current + (wasRunning ? Date.now() - startedAtRef.current : 0));
    const target = list[current].endMs;
    const total = totalDuration(list);

    if (target >= total) {
      accumulatedRef.current = total;
      doneRef.current = true;
      setElapsedMs(total);
      setRunning(false);
      setDone(true);
      const complete = optionsRef.current.onComplete;
      if (complete) {
        complete();
      }
      return;
    }

    accumulatedRef.current = target;
    setElapsedMs(target);
    const idx = stepIndexAt(list, target);
    stepIndexRef.current = idx;
    const changed = optionsRef.current.onStepChange;
    if (changed) {
      changed(idx, list[idx]);
    }
    if (wasRunning) {
      startedAtRef.current = Date.now();
      intervalRef.current = setInterval(tick, TICK_MS);
    } else {
      setRunning(false);
    }
  }, [stopInterval, tick]);

  const reset = useCallback(() => {
    stopInterval();
    accumulatedRef.current = 0;
    stepIndexRef.current = 0;
    doneRef.current = false;
    setElapsedMs(0);
    setRunning(false);
    setDone(false);
  }, [stopInterval]);

  useEffect(() => {
    if (options.autoStart) {
      startedAtRef.current = Date.now();
      setRunning(true);
      intervalRef.current = setInterval(tick, TICK_MS);
    }
    return stopInterval;
    // mount only — autoStart is a launch flag, not a live switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = totalDuration(steps);
  const index = steps.length > 0 ? stepIndexAt(steps, elapsedMs) : 0;
  const step = steps.length > 0 ? steps[index] : null;
  const stepProgress = step ? stepProgressAt(step, elapsedMs) : 0;
  const totalProgress = total > 0 ? elapsedMs / total : 0;
  const stepRemainingMs = step ? Math.max(0, step.endMs - elapsedMs) : 0;

  return {
    elapsedMs,
    running,
    done,
    index,
    step,
    stepProgress,
    totalProgress,
    stepRemainingMs,
    totalMs: total,
    start,
    pause,
    toggle,
    skipStep,
    reset,
  };
}

export default useBrewTimer;
