import { describe, expect, it } from "vitest";
import { scaleLinear } from "../linear.js";
import { scaleLog } from "../log.js";
import { scaleTime } from "../time.js";

describe("bounded tick generation", () => {
  it.each([
    [1, 1 + Number.EPSILON],
    [1 + Number.EPSILON, 1],
    [-1 - Number.EPSILON, -1],
    [1e16, 1e16 + 2],
    [Number.MIN_VALUE, Number.MIN_VALUE * 2],
    [-Number.MAX_VALUE, Number.MAX_VALUE],
  ] as const)("handles representability limits [%s, %s]", (start, stop) => {
    const ticks = scaleLinear([start, stop], [0, 1]).ticks();
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.length).toBeLessThanOrEqual(10000);
    expect(new Set(ticks).size).toBe(ticks.length);
    for (const tick of ticks) {
      expect(Number.isFinite(tick)).toBe(true);
      expect(tick).toBeGreaterThanOrEqual(Math.min(start, stop));
      expect(tick).toBeLessThanOrEqual(Math.max(start, stop));
    }
  });

  it.each([-1, 0, NaN, Infinity, 10001])("rejects unsafe tick count %s", (count) => {
    expect(() => scaleLinear([0, 1], [0, 1]).ticks(count)).toThrow(RangeError);
    expect(() => scaleLog([1, 100], [0, 1]).ticks!(count)).toThrow(RangeError);
    expect(() => scaleTime([new Date(0), new Date(1000)], [0, 1]).ticks(count)).toThrow(RangeError);
  });

  it.each([1, 0, -1, Infinity, NaN])("rejects invalid logarithm base %s", (base) => {
    expect(() => scaleLog([2, 4], [0, 1], base)).toThrow(RangeError);
  });

  it("supports reciprocal bases and reversed logarithmic domains", () => {
    expect(scaleLog([1, 8], [0, 1], 0.5).ticks!()).toEqual([1, 2, 4, 8]);
    expect(scaleLog([8, 1], [0, 1], 2).ticks!()).toEqual([8, 4, 2, 1]);
    expect(scaleLog([-1, -8], [0, 1], 2).ticks!()).toEqual([-1, -2, -4, -8]);
  });

  it("validates domains after mutation", () => {
    const linear = scaleLinear([0, 1], [0, 1]);
    linear.setDomain([0, Infinity]);
    expect(() => linear.ticks()).toThrow(RangeError);
    const log = scaleLog([1, 100], [0, 1]);
    log.setDomain([-1, 1]);
    expect(() => log.ticks!()).toThrow(RangeError);
    const date = new Date(0);
    const time = scaleTime([date, new Date(1000)], [0, 1]);
    date.setTime(NaN);
    expect(() => time.ticks()).toThrow(RangeError);
  });

  it.each([
    [1e308, Number.MAX_VALUE],
    [Number.MAX_VALUE, 1e308],
    [-Number.MAX_VALUE, -1e308],
    [Number.MIN_VALUE, Number.MIN_VALUE * 10],
  ] as const)("keeps logarithmic ticks finite and distinct [%s, %s]", (start, stop) => {
    const ticks = scaleLog([start, stop], [0, 1]).ticks!();
    expect(ticks.length).toBeGreaterThan(0);
    expect(new Set(ticks).size).toBe(ticks.length);
    for (const tick of ticks) {
      expect(Number.isFinite(tick)).toBe(true);
      expect(tick).not.toBe(0);
    }
  });

  it.each([
    ["+275750-01-01T00:00:00.000Z", "+275760-09-13T00:00:00.000Z"],
    ["+275760-01-01T00:00:00.000Z", "+275760-09-13T00:00:00.000Z"],
    ["-271821-04-20T00:00:00.000Z", "-271820-01-01T00:00:00.000Z"],
  ])("stops calendar ticks at Date limits %s..%s", (from, to) => {
    const start = new Date(from);
    const stop = new Date(to);
    const ticks = scaleTime([start, stop], [0, 1]).ticks();
    expect(ticks.length).toBeLessThanOrEqual(10000);
    expect(ticks.every((tick) => Number.isFinite(tick.getTime()))).toBe(true);
    expect(scaleTime([stop, start], [0, 1]).ticks()).toEqual([...ticks].reverse());
  });

  it("rejects excessive actual work even with a small requested count", () => {
    const scale = scaleTime([new Date(-8640000000000000), new Date(8640000000000000)], [0, 1]);
    expect(() => scale.ticks(10)).toThrow(RangeError);
  });
});
