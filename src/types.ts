/**
 * Base scale function type
 */
export type ScaleFunction<Domain, Range> = {
  (value: Domain): Range;
  domain: () => readonly Domain[];
  range: () => readonly Range[];
  clamp: (enable: boolean) => ScaleFunction<Domain, Range>;
  setDomain: (domain: readonly Domain[]) => ScaleFunction<Domain, Range>;
  setRange: (range: readonly Range[]) => ScaleFunction<Domain, Range>;
  invert?: (value: Range) => Domain;
  ticks?: (count?: number) => Domain[];
  nice?: (count?: number) => ScaleFunction<Domain, Range>;
};

/**
 * Band scale function type
 */
export type BandScaleFunction<Domain> = {
  (value: Domain): number;
  domain: () => readonly Domain[];
  range: () => readonly [number, number];
  setDomain: (domain: readonly Domain[]) => BandScaleFunction<Domain>;
  setRange: (range: readonly [number, number]) => BandScaleFunction<Domain>;
  bandwidth: () => number;
  padding: (value: number) => BandScaleFunction<Domain>;
  paddingInner: (value: number) => BandScaleFunction<Domain>;
  paddingOuter: (value: number) => BandScaleFunction<Domain>;
  step: () => number;
};

/**
 * Ordinal scale function type — maps discrete domain values to discrete range values
 */
export type OrdinalScaleFunction<Domain, Range> = {
  (value: Domain): Range | undefined;
  domain: () => readonly Domain[];
  range: () => readonly Range[];
  setDomain: (domain: readonly Domain[]) => OrdinalScaleFunction<Domain, Range>;
  setRange: (range: readonly Range[]) => OrdinalScaleFunction<Domain, Range>;
  unknown: () => Range | undefined;
  setUnknown: (value: Range) => OrdinalScaleFunction<Domain, Range>;
};

/**
 * Clamps a value between min and max
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function interpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Normalize a value to [0, 1] range
 */
export function normalize(value: number, min: number, max: number): number {
  return max === min ? 0 : (value - min) / (max - min);
}

/**
 * Computes a nice tick step size for a given domain span and target tick count.
 * Uses the d3-style algorithm: picks the largest of 1×, 2×, 5×, or 10× the
 * nearest power of 10 that keeps the step ≤ span/count.
 */
export function tickStep(start: number, stop: number, count: number): number {
  const step0 = Math.abs(stop - start) / Math.max(0, count);
  if (step0 === 0) return 0;
  const step1 = Math.pow(10, Math.floor(Math.log10(step0)));
  const error = step0 / step1;
  if (error >= Math.sqrt(50)) return step1 * 10;
  if (error >= Math.sqrt(10)) return step1 * 5;
  if (error >= Math.sqrt(2)) return step1 * 2;
  return step1;
}
