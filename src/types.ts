/**
 * Base scale function type
 */
export type ScaleFunction<Domain, Range> = {
  (value: Domain): Range;
  domain: () => readonly Domain[];
  range: () => readonly Range[];
  clamp: (enable: boolean) => ScaleFunction<Domain, Range>;
  invert?: (value: Range) => Domain;
};

/**
 * Band scale function type
 */
export type BandScaleFunction<Domain> = {
  (value: Domain): number;
  domain: () => readonly Domain[];
  range: () => readonly [number, number];
  bandwidth: () => number;
  padding: (value: number) => BandScaleFunction<Domain>;
  paddingInner: (value: number) => BandScaleFunction<Domain>;
  paddingOuter: (value: number) => BandScaleFunction<Domain>;
  step: () => number;
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
