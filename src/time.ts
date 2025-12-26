import type { ScaleFunction } from './types';
import { clampValue, interpolate, normalize } from './types';

/**
 * Creates a time scale that maps Date objects to a continuous range
 * Useful for time-based charts, timelines, and Gantt charts
 *
 * @example
 * const start = new Date('2024-01-01');
 * const end = new Date('2024-12-31');
 * const scale = scaleTime([start, end], [0, 500]);
 * scale(new Date('2024-06-30')); // ~250
 *
 * @example
 * // With clamping
 * const scale = scaleTime([start, end], [0, 500]).clamp(true);
 * scale(new Date('2025-01-01')); // 500 (clamped)
 *
 * @param domain - [start, end] Date objects
 * @param range - [min, max] range values
 * @returns Scale function with domain, range, clamp, and invert methods
 */
export function scaleTime(
  domain: readonly [Date, Date],
  range: readonly [number, number],
): ScaleFunction<Date, number> {
  let d = [...domain] as [Date, Date];
  let r = [...range] as [number, number];
  let shouldClamp = false;

  const scale = (value: Date): number => {
    const t = normalize(value.getTime(), d[0].getTime(), d[1].getTime());
    const result = interpolate(r[0], r[1], t);
    return shouldClamp ? clampValue(result, Math.min(r[0], r[1]), Math.max(r[0], r[1])) : result;
  };

  scale.domain = () => d;
  scale.range = () => r;

  scale.clamp = (enable: boolean) => {
    shouldClamp = enable;
    return scale;
  };

  scale.invert = (value: number): Date => {
    const t = normalize(value, r[0], r[1]);
    const timestamp = interpolate(d[0].getTime(), d[1].getTime(), t);
    return new Date(timestamp);
  };

  return scale;
}
