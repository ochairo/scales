import type { ScaleFunction } from "./types.js";
import { clampValue, interpolate, normalize } from "./types.js";

/**
 * Creates a power scale that applies an exponential transform before linear mapping.
 * Useful for area-based encodings where visual perception is non-linear.
 *
 * Negative domain values are supported — the sign is preserved through the transform.
 *
 * @example
 * // Quadratic (exponent 2) — equal visual area for equal data area
 * const scale = scalePow([0, 100], [0, 500], 2);
 * scale(0);   // 0
 * scale(50);  // 125  (not 250 — compressed at low end)
 * scale(100); // 500
 *
 * @example
 * // Square root (exponent 0.5) — use scaleSqrt() as a convenience
 * const scale = scalePow([0, 100], [0, 500], 0.5);
 * scale(25);  // 250 (sqrt(25)/sqrt(100) = 0.5)
 *
 * @param domain - [min, max] domain values
 * @param range - [min, max] range values
 * @param exponent - power exponent (default: 1, equivalent to scaleLinear)
 * @returns Scale function with domain, range, clamp, and invert methods
 */
export function scalePow(
  domain: readonly [number, number],
  range: readonly [number, number],
  exponent: number = 1,
): ScaleFunction<number, number> & {
  invert: (value: number) => number;
} {
  let d = [...domain] as [number, number];
  let r = [...range] as [number, number];
  let shouldClamp = false;

  // Preserves sign through power transform so negative domains work correctly
  const pow = (x: number): number =>
    x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);

  const scale = (value: number): number => {
    const t = normalize(pow(value), pow(d[0]), pow(d[1]));
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
    const powVal = interpolate(pow(d[0]), pow(d[1]), t);
    return powVal < 0
      ? -Math.pow(-powVal, 1 / exponent)
      : Math.pow(powVal, 1 / exponent);
  };

  return scale;
}

/**
 * Creates a square-root scale — shorthand for `scalePow(domain, range, 0.5)`.
 * Commonly used when mapping data values to circle areas (radius = sqrt(area)).
 *
 * @example
 * const scale = scaleSqrt([0, 100], [0, 10]);
 * scale(25);  // 5  (sqrt(25) / sqrt(100) * 10)
 * scale(100); // 10
 */
export function scaleSqrt(
  domain: readonly [number, number],
  range: readonly [number, number],
): ScaleFunction<number, number> & {
  invert: (value: number) => number;
} {
  return scalePow(domain, range, 0.5);
}
