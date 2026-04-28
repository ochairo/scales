import type { ScaleFunction } from "./types.js";
import { clampValue, interpolate, normalize } from "./types.js";

/**
 * Creates a logarithmic scale that maps a continuous domain to a continuous range
 * using a logarithmic transform. Useful for data spanning many orders of magnitude.
 *
 * The domain must not contain zero and must not cross zero (all positive or all negative).
 *
 * @example
 * const scale = scaleLog([1, 1000], [0, 300]);
 * scale(1);    // 0
 * scale(10);   // 100
 * scale(100);  // 200
 * scale(1000); // 300
 *
 * @example
 * // Custom base (base 2)
 * const scale = scaleLog([1, 8], [0, 300], 2);
 * scale(1); // 0
 * scale(2); // 100
 * scale(4); // 200
 * scale(8); // 300
 *
 * @param domain - [min, max] domain values (must not include or cross zero)
 * @param range - [min, max] range values
 * @param base - logarithm base (default: 10)
 * @returns Scale function with domain, range, clamp, and invert methods
 */
export function scaleLog(
  domain: readonly [number, number],
  range: readonly [number, number],
  base: number = 10,
): ScaleFunction<number, number> & {
  invert: (value: number) => number;
} {
  let d = [...domain] as [number, number];
  let r = [...range] as [number, number];
  let shouldClamp = false;

  const logBase = Math.log(base);

  // Handles negative domains by mirroring through log space
  const log = (x: number): number =>
    x < 0 ? -Math.log(-x) / logBase : Math.log(x) / logBase;

  const scale = (value: number): number => {
    const t = normalize(log(value), log(d[0]), log(d[1]));
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

  scale.ticks = (count = 10): number[] => {
    // Work in absolute space; handle negative domains at the end
    const isNeg = d[0] < 0;
    const absMin = isNeg ? Math.abs(d[1]) : d[0];
    const absMax = isNeg ? Math.abs(d[0]) : d[1];

    const lo = Math.floor(Math.log(absMin) / logBase);
    const hi = Math.ceil(Math.log(absMax) / logBase);
    const nDecades = hi - lo;

    if (nDecades <= 0) return [];

    const result: number[] = [];

    if (base === 10 && nDecades < count) {
      // For base 10 include nice sub-decade multipliers (1,2,5 pattern)
      const tpd = Math.round(count / nDecades);
      const mults =
        tpd >= 9
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
          : tpd >= 3
            ? [1, 2, 5]
            : tpd >= 2
              ? [1, 5]
              : [1];

      for (let e = lo; e < hi; e++) {
        for (const m of mults) {
          const v = Math.pow(10, e) * m;
          // Small epsilon to handle floating point boundaries
          if (v >= absMin - absMax * 1e-10 && v <= absMax + absMax * 1e-10) {
            result.push(v);
          }
        }
      }
      // Always include the upper power boundary
      const vHi = Math.pow(10, hi);
      if (vHi >= absMin - absMax * 1e-10 && vHi <= absMax + absMax * 1e-10) {
        result.push(vHi);
      }
    } else {
      // For other bases or when decades >> count: use powers only, stepping if needed
      const step = nDecades > count ? Math.ceil(nDecades / count) : 1;
      for (let e = lo; e <= hi; e += step) {
        const v = Math.pow(base, e);
        if (v >= absMin - absMax * 1e-10 && v <= absMax + absMax * 1e-10) {
          result.push(v);
        }
      }
    }

    const ticks = isNeg ? result.map((v) => -v).reverse() : result;
    return d[0] <= d[1] ? ticks : [...ticks].reverse();
  };

  scale.invert = (value: number): number => {
    const t = normalize(value, r[0], r[1]);
    const logVal = interpolate(log(d[0]), log(d[1]), t);
    // Negative domains always produce logVal ≤ 0; use domain sign to determine direction
    return d[0] < 0 ? -Math.pow(base, -logVal) : Math.pow(base, logVal);
  };

  return scale;
}
