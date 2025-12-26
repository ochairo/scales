import type { BandScaleFunction } from './types';

/**
 * Creates a band scale that maps discrete domain values to continuous range bands
 * Useful for bar charts, categorical axes, and grouped layouts
 *
 * @example
 * const scale = scaleBand(['A', 'B', 'C'], [0, 300]);
 * scale('A'); // 0
 * scale('B'); // 100
 * scale('C'); // 200
 * scale.bandwidth(); // 100
 *
 * @example
 * // With padding
 * const scale = scaleBand(['A', 'B', 'C'], [0, 300]).padding(0.1);
 * scale('A'); // ~15
 * scale.bandwidth(); // ~85
 *
 * @param domain - Array of discrete values
 * @param range - [min, max] range values
 * @returns Band scale function with domain, range, bandwidth, padding, and step methods
 */
export function scaleBand<T>(
  domain: readonly T[],
  range: readonly [number, number],
): BandScaleFunction<T> {
  let d = [...domain];
  let r = [...range] as [number, number];
  let paddingInnerValue = 0;
  let paddingOuterValue = 0;

  const computePositions = () => {
    const n = d.length;
    if (n === 0) {
      return { step: 0, bandwidth: 0, offset: 0 };
    }

    const [start, end] = r;
    const reverse = end < start;
    const [r0, r1] = reverse ? [end, start] : [start, end];

    const step = (r1 - r0) / (n - paddingInnerValue + paddingOuterValue * 2);
    const bandwidth = step * (1 - paddingInnerValue);
    const offset = r0 + step * paddingOuterValue;

    return { step, bandwidth, offset, reverse };
  };

  const scale = (value: T): number => {
    const index = d.indexOf(value);
    if (index === -1) {
      return Number.NaN;
    }

    const { step, offset, reverse } = computePositions();
    const position = offset + index * step;

    return reverse ? r[0] - (position - r[1]) : position;
  };

  scale.domain = () => d as readonly T[];
  scale.range = () => r;

  scale.bandwidth = (): number => {
    return computePositions().bandwidth;
  };

  scale.step = (): number => {
    return computePositions().step;
  };

  scale.padding = (value: number) => {
    paddingInnerValue = value;
    paddingOuterValue = value;
    return scale;
  };

  scale.paddingInner = (value: number) => {
    paddingInnerValue = value;
    return scale;
  };

  scale.paddingOuter = (value: number) => {
    paddingOuterValue = value;
    return scale;
  };

  return scale;
}
