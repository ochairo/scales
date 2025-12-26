/**
 * @levin/scales - Framework-agnostic scale functions for data visualization
 *
 * Pure mathematical functions for mapping data values to visual coordinates.
 * Perfect for building charts, timelines, Gantt charts, and any custom visualization.
 *
 * @example Linear scale
 * ```ts
 * const scale = scaleLinear([0, 100], [0, 500]);
 * scale(50); // 250
 * ```
 *
 * @example Band scale for bar charts
 * ```ts
 * const scale = scaleBand(['A', 'B', 'C'], [0, 300]);
 * scale('B'); // 100
 * scale.bandwidth(); // 100
 * ```
 *
 * @example Time scale for timelines
 * ```ts
 * const scale = scaleTime(
 *   [new Date('2024-01-01'), new Date('2024-12-31')],
 *   [0, 500]
 * );
 * scale(new Date('2024-06-30')); // ~250
 * ```
 *
 * @module
 */

export { scaleLinear } from './linear';
export { scaleBand } from './band';
export { scaleTime } from './time';

export type { ScaleFunction, BandScaleFunction } from './types';
