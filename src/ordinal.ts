import type { OrdinalScaleFunction } from "./types.js";

/**
 * Creates an ordinal scale that maps discrete domain values to discrete range values.
 * Commonly used to assign colors, shapes, or patterns to categorical data.
 *
 * Range values cycle when there are more domain values than range values.
 * Values not in the domain return `undefined` unless `setUnknown()` is configured.
 *
 * @example
 * // Mapping categories to colors
 * const color = scaleOrdinal(
 *   ['apples', 'bananas', 'cherries'],
 *   ['#ff0000', '#ffff00', '#ff00ff'],
 * );
 * color('apples');   // '#ff0000'
 * color('bananas');  // '#ffff00'
 * color('unknown');  // undefined
 *
 * @example
 * // Range cycling
 * const scale = scaleOrdinal([1, 2, 3, 4], ['a', 'b']);
 * scale(1); // 'a'
 * scale(2); // 'b'
 * scale(3); // 'a'  (cycles back)
 * scale(4); // 'b'
 *
 * @example
 * // Unknown fallback
 * const scale = scaleOrdinal(['a', 'b'], [1, 2]).setUnknown(-1);
 * scale('c'); // -1
 *
 * @param domain - Array of discrete domain values
 * @param range - Array of discrete range values
 * @returns Ordinal scale function with domain, range, unknown, and setUnknown methods
 */
export function scaleOrdinal<Domain, Range>(
  domain: readonly Domain[],
  range: readonly Range[],
): OrdinalScaleFunction<Domain, Range> {
  let d = [...domain];
  let r = [...range];
  let unknownValue: Range | undefined;

  const scale = (value: Domain): Range | undefined => {
    const i = d.indexOf(value);
    if (i === -1) return unknownValue;
    return r[i % r.length];
  };

  scale.domain = () => d as readonly Domain[];
  scale.range = () => r as readonly Range[];

  scale.setDomain = (domain: readonly Domain[]) => {
    d = [...domain];
    return scale;
  };

  scale.setRange = (range: readonly Range[]) => {
    r = [...range];
    return scale;
  };

  scale.unknown = () => unknownValue;

  scale.setUnknown = (value: Range) => {
    unknownValue = value;
    return scale;
  };

  return scale;
}
