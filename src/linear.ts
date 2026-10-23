import type { ScaleFunction } from "./types.js";
import { clampValue, interpolate, normalize, tickStep } from "./types.js";
import { assertTickBudget, validateTickRequest } from "./tick-budget.js";

/**
 * Creates a linear scale that maps a continuous domain to a continuous range
 *
 * @example
 * const scale = scaleLinear([0, 100], [0, 500]);
 * scale(50); // 250
 * scale(25); // 125
 *
 * @example
 * // With clamping
 * const scale = scaleLinear([0, 100], [0, 500]).clamp(true);
 * scale(150); // 500 (clamped)
 * scale(-50); // 0 (clamped)
 *
 * @example
 * // Nice ticks for axis rendering
 * const scale = scaleLinear([0, 95], [0, 500]).nice();
 * scale.ticks(); // [0, 10, 20, ..., 100]
 *
 * @param domain - [min, max] domain values
 * @param range - [min, max] range values
 * @returns Scale function with domain, range, clamp, invert, ticks, and nice methods
 */
export function scaleLinear(
  domain: readonly [number, number],
  range: readonly [number, number],
): ScaleFunction<number, number> & {
  invert: (value: number) => number;
  ticks: (count?: number) => number[];
  nice: (count?: number) => ScaleFunction<number, number>;
} {
  let d = [...domain] as [number, number];
  let r = [...range] as [number, number];
  let shouldClamp = false;

  const scale = (value: number): number => {
    const t = normalize(value, d[0], d[1]);
    const result = interpolate(r[0], r[1], t);
    return shouldClamp
      ? clampValue(result, Math.min(r[0], r[1]), Math.max(r[0], r[1]))
      : result;
  };

  scale.domain = () => d as readonly number[];
  scale.range = () => r as readonly number[];

  scale.clamp = (enable: boolean) => {
    shouldClamp = enable;
    return scale;
  };

  scale.setDomain = (domain: readonly number[]) => {
    d = [domain[0]!, domain[1]!];
    return scale;
  };

  scale.setRange = (range: readonly number[]) => {
    r = [range[0]!, range[1]!];
    return scale;
  };

  scale.invert = (value: number): number => {
    const t = normalize(value, r[0], r[1]);
    return interpolate(d[0], d[1], t);
  };

  scale.ticks = (count = 10): number[] => {
    const [start, stop] = d[0] <= d[1] ? [d[0], d[1]] : [d[1], d[0]];
    validateTickRequest(count, start, stop);
    const endpoints = (): number[] => d[0] === d[1] ? [d[0]] : [d[0], d[1]];
    const step = tickStep(start, stop, count);
    if (!(step > 0) || !Number.isFinite(step)) return endpoints();
    const i0 = Math.ceil(start / step);
    const i1 = Math.floor(stop / step);
    if (!Number.isFinite(i0) || !Number.isFinite(i1)) return endpoints();
    const ticks: number[] = [];
    // Absolute indexes above 2^53 may not advance when incremented by one.
    for (let offset = 0; offset <= i1 - i0; offset++) {
      assertTickBudget(offset);
      const tick = (i0 + offset) * step;
      if (Number.isFinite(tick) && tick >= start && tick <= stop && tick !== ticks[ticks.length - 1]) {
        ticks.push(tick);
      }
    }
    if (ticks.length === 0) return endpoints();
    return d[0] <= d[1] ? ticks : ticks.reverse();
  };

  scale.nice = (count = 10) => {
    const [start, stop] = d[0] <= d[1] ? [d[0], d[1]] : [d[1], d[0]];
    validateTickRequest(count, start, stop);
    const step = tickStep(start, stop, count);
    if (step > 0 && Number.isFinite(step)) {
      const niceStart = Math.floor(start / step) * step;
      const niceStop = Math.ceil(stop / step) * step;
      if (Number.isFinite(niceStart) && Number.isFinite(niceStop)) {
        d = d[0] <= d[1] ? [niceStart, niceStop] : [niceStop, niceStart];
      }
    }
    return scale;
  };

  return scale;
}
