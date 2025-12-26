import type { ScaleFunction } from './types';
import { clampValue, interpolate, normalize } from './types';

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
 * @param domain - [min, max] domain values
 * @param range - [min, max] range values
 * @returns Scale function with domain, range, clamp, and invert methods
 */
export function scaleLinear(
  domain: readonly [number, number],
  range: readonly [number, number],
): ScaleFunction<number, number> {
  let d = [...domain] as [number, number];
  let r = [...range] as [number, number];
  let shouldClamp = false;

  const scale = (value: number): number => {
    const t = normalize(value, d[0], d[1]);
    const result = interpolate(r[0], r[1], t);
    return shouldClamp ? clampValue(result, Math.min(r[0], r[1]), Math.max(r[0], r[1])) : result;
  };

  scale.domain = () => d;
  scale.range = () => r;

  scale.clamp = (enable: boolean) => {
    shouldClamp = enable;
    return scale;
  };

  scale.invert = (value: number): number => {
    const t = normalize(value, r[0], r[1]);
    return interpolate(d[0], d[1], t);
  };

  return scale;
}
