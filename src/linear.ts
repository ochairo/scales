import type { ScaleFunction } from "./types.js";
import { clampValue, interpolate, normalize, tickStep } from "./types.js";

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
    const step = tickStep(start, stop, count);
    if (step === 0) return [start];
    const i0 = Math.ceil(start / step);
    const i1 = Math.floor(stop / step);
    const ticks: number[] = [];
    for (let i = i0; i <= i1; i++) {
      ticks.push(i * step);
    }
    return d[0] <= d[1] ? ticks : ticks.reverse();
  };

  scale.nice = (count = 10) => {
    const [start, stop] = d[0] <= d[1] ? [d[0], d[1]] : [d[1], d[0]];
    const step = tickStep(start, stop, count);
    if (step > 0) {
      const niceStart = Math.floor(start / step) * step;
      const niceStop = Math.ceil(stop / step) * step;
      d = d[0] <= d[1] ? [niceStart, niceStop] : [niceStop, niceStart];
    }
    return scale;
  };

  return scale;
}
