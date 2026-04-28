import type { ScaleFunction } from "./types.js";
import { clampValue, interpolate, normalize } from "./types.js";

/**
 * Creates a time scale that maps Date objects to a continuous range
 * Useful for time-based charts, timelines, and Gantt charts
 *
 * @example
 * const start = new Date('2024-01-01');
 * const end = new Date('2024-12-31');
 * const scale = scaleTime([start, end], [0, 500]);
 * scale(new Date('2024-06-30')); // ~250
 * scale.ticks(6); // [Jan, Mar, May, Jul, Sep, Nov]
 *
 * @example
 * // With clamping
 * const scale = scaleTime([start, end], [0, 500]).clamp(true);
 * scale(new Date('2025-01-01')); // 500 (clamped)
 *
 * @param domain - [start, end] Date objects
 * @param range - [min, max] range values
 * @returns Scale function with domain, range, clamp, invert, and ticks methods
 */
export function scaleTime(
  domain: readonly [Date, Date],
  range: readonly [number, number],
): ScaleFunction<Date, number> & {
  invert: (value: number) => Date;
  ticks: (count?: number) => Date[];
} {
  let d = [...domain] as [Date, Date];
  let r = [...range] as [number, number];
  let shouldClamp = false;

  const scale = (value: Date): number => {
    const t = normalize(value.getTime(), d[0].getTime(), d[1].getTime());
    const result = interpolate(r[0], r[1], t);
    return shouldClamp
      ? clampValue(result, Math.min(r[0], r[1]), Math.max(r[0], r[1]))
      : result;
  };

  scale.domain = () => d as readonly Date[];
  scale.range = () => r as readonly number[];

  scale.clamp = (enable: boolean) => {
    shouldClamp = enable;
    return scale;
  };

  scale.setDomain = (domain: readonly Date[]) => {
    d = [domain[0]!, domain[1]!];
    return scale;
  };

  scale.setRange = (range: readonly number[]) => {
    r = [range[0]!, range[1]!];
    return scale;
  };

  scale.invert = (value: number): Date => {
    const t = normalize(value, r[0], r[1]);
    const timestamp = interpolate(d[0].getTime(), d[1].getTime(), t);
    return new Date(timestamp);
  };

  scale.ticks = (count = 10): Date[] => {
    const t0 = d[0].getTime();
    const t1 = d[1].getTime();
    const [start, stop] = t0 <= t1 ? [t0, t1] : [t1, t0];
    const span = stop - start;
    const target = span / Math.max(1, count);

    // Each candidate carries its approximate ms length for interval selection,
    // and a kind that drives calendar-aware snapping
    type FixedMs = { readonly kind: "ms"; readonly ms: number };
    type CalMonth = { readonly kind: "month"; readonly months: number };
    type CalYear = { readonly kind: "year"; readonly years: number };
    type IntervalSpec = FixedMs | CalMonth | CalYear;

    const candidates: ReadonlyArray<{
      readonly spec: IntervalSpec;
      readonly ms: number;
    }> = [
      { spec: { kind: "ms", ms: 1 }, ms: 1 },
      { spec: { kind: "ms", ms: 5 }, ms: 5 },
      { spec: { kind: "ms", ms: 10 }, ms: 10 },
      { spec: { kind: "ms", ms: 50 }, ms: 50 },
      { spec: { kind: "ms", ms: 100 }, ms: 100 },
      { spec: { kind: "ms", ms: 250 }, ms: 250 },
      { spec: { kind: "ms", ms: 500 }, ms: 500 },
      { spec: { kind: "ms", ms: 1_000 }, ms: 1_000 },
      { spec: { kind: "ms", ms: 5_000 }, ms: 5_000 },
      { spec: { kind: "ms", ms: 15_000 }, ms: 15_000 },
      { spec: { kind: "ms", ms: 30_000 }, ms: 30_000 },
      { spec: { kind: "ms", ms: 60_000 }, ms: 60_000 },
      { spec: { kind: "ms", ms: 300_000 }, ms: 300_000 },
      { spec: { kind: "ms", ms: 900_000 }, ms: 900_000 },
      { spec: { kind: "ms", ms: 1_800_000 }, ms: 1_800_000 },
      { spec: { kind: "ms", ms: 3_600_000 }, ms: 3_600_000 },
      { spec: { kind: "ms", ms: 10_800_000 }, ms: 10_800_000 },
      { spec: { kind: "ms", ms: 21_600_000 }, ms: 21_600_000 },
      { spec: { kind: "ms", ms: 43_200_000 }, ms: 43_200_000 },
      { spec: { kind: "ms", ms: 86_400_000 }, ms: 86_400_000 },
      { spec: { kind: "ms", ms: 604_800_000 }, ms: 604_800_000 },
      { spec: { kind: "month", months: 1 }, ms: 2_629_800_000 },
      { spec: { kind: "month", months: 3 }, ms: 7_889_400_000 },
      { spec: { kind: "month", months: 6 }, ms: 15_778_800_000 },
      { spec: { kind: "year", years: 1 }, ms: 31_557_600_000 },
      { spec: { kind: "year", years: 2 }, ms: 63_115_200_000 },
      { spec: { kind: "year", years: 5 }, ms: 157_788_000_000 },
      { spec: { kind: "year", years: 10 }, ms: 315_576_000_000 },
    ];

    let best = candidates[0]!;
    let bestDiff = Infinity;
    for (const c of candidates) {
      const diff = Math.abs(c.ms - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = c;
      }
    }

    const ticks: Date[] = [];
    const { spec } = best;

    if (spec.kind === "ms") {
      // Fixed millisecond intervals — epoch-aligned snapping works for all
      const first = Math.ceil(start / spec.ms) * spec.ms;
      for (let t = first; t <= stop; t += spec.ms) {
        ticks.push(new Date(t));
      }
    } else if (spec.kind === "month") {
      // Calendar-aware monthly snapping
      const startDate = new Date(start);
      let year = startDate.getUTCFullYear();
      let month = startDate.getUTCMonth();

      // Advance to the start of the next month boundary if not exactly there
      if (
        startDate.getUTCDate() !== 1 ||
        startDate.getUTCHours() !== 0 ||
        startDate.getUTCMinutes() !== 0
      ) {
        month += 1;
        if (month >= 12) {
          year += 1;
          month = 0;
        }
      }

      // Align to the nearest multiple-of-months boundary (e.g. Q1/Q2/Q3/Q4 for 3-month)
      month = Math.ceil(month / spec.months) * spec.months;
      while (month >= 12) {
        year += 1;
        month -= 12;
      }

      while (true) {
        const t = Date.UTC(year, month, 1);
        if (t > stop) break;
        ticks.push(new Date(t));
        month += spec.months;
        while (month >= 12) {
          year += 1;
          month -= 12;
        }
      }
    } else {
      // Calendar-aware yearly snapping
      const startDate = new Date(start);
      let year = startDate.getUTCFullYear();

      // Advance to the next year boundary if not exactly on Jan 1 00:00 UTC
      if (
        startDate.getUTCMonth() !== 0 ||
        startDate.getUTCDate() !== 1 ||
        startDate.getUTCHours() !== 0
      ) {
        year += 1;
      }

      // Align to multiple-of-years boundary (e.g. decades for 10-year step)
      year = Math.ceil(year / spec.years) * spec.years;

      while (true) {
        const t = Date.UTC(year, 0, 1);
        if (t > stop) break;
        ticks.push(new Date(t));
        year += spec.years;
      }
    }

    return t0 <= t1 ? ticks : ticks.reverse();
  };

  return scale;
}
