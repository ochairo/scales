import { describe, it, expect } from "vitest";
import { scaleLinear } from "../linear";
import { scalePow, scaleSqrt } from "../pow";
import { scaleBand } from "../band";
import { scaleOrdinal } from "../ordinal";
import { scaleTime } from "../time";

// ── scaleLinear ────────────────────────────────────────────────────────────────

describe("scaleLinear setDomain / setRange", () => {
  it("should update domain and immediately affect output", () => {
    const scale = scaleLinear([0, 100], [0, 500]);

    scale.setDomain([0, 200]);

    expect(scale.domain()).toEqual([0, 200]);
    expect(scale(100)).toBeCloseTo(250);
    expect(scale(200)).toBeCloseTo(500);
  });

  it("should update range and immediately affect output", () => {
    const scale = scaleLinear([0, 100], [0, 500]);

    scale.setRange([0, 1000]);

    expect(scale.range()).toEqual([0, 1000]);
    expect(scale(50)).toBeCloseTo(500);
  });

  it("should keep ticks correct after domain update", () => {
    const scale = scaleLinear([0, 100], [0, 500]);
    scale.setDomain([0, 200]);

    const ticks = scale.ticks(5);

    expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(200);
    expect(ticks[0]).toBeGreaterThanOrEqual(0);
  });

  it("should keep invert correct after range update", () => {
    const scale = scaleLinear([0, 100], [0, 500]);
    scale.setRange([0, 1000]);

    expect(scale.invert(500)).toBeCloseTo(50);
    expect(scale.invert(1000)).toBeCloseTo(100);
  });
});

// ── scalePow ───────────────────────────────────────────────────────────────────

describe("scalePow setDomain / setRange", () => {
  it("should update domain and immediately affect output", () => {
    const scale = scalePow([0, 100], [0, 500], 2);

    scale.setDomain([0, 50]);

    expect(scale.domain()).toEqual([0, 50]);
    expect(scale(50)).toBeCloseTo(500);
  });

  it("should update range and immediately affect output", () => {
    const scale = scalePow([0, 100], [0, 500], 2);

    scale.setRange([0, 200]);

    expect(scale.range()).toEqual([0, 200]);
    expect(scale(100)).toBeCloseTo(200);
  });

  it("scaleSqrt should also support setDomain / setRange", () => {
    const scale = scaleSqrt([0, 100], [0, 10]);

    scale.setDomain([0, 25]);
    expect(scale(25)).toBeCloseTo(10);

    scale.setRange([0, 20]);
    expect(scale(25)).toBeCloseTo(20);
  });
});

// ── scaleBand ──────────────────────────────────────────────────────────────────

describe("scaleBand setDomain / setRange", () => {
  it("should update domain and recalculate positions", () => {
    const scale = scaleBand(["A", "B"], [0, 200]);

    scale.setDomain(["A", "B", "C"]);

    expect(scale.domain()).toEqual(["A", "B", "C"]);
    expect(scale.bandwidth()).toBeCloseTo(200 / 3, 1);
  });

  it("should update range and recalculate bandwidth", () => {
    const scale = scaleBand(["A", "B", "C"], [0, 300]);

    scale.setRange([0, 600]);

    expect(scale.range()).toEqual([0, 600]);
    expect(scale.bandwidth()).toBeCloseTo(200);
  });

  it("should correctly position items after domain update", () => {
    const scale = scaleBand(["X"], [0, 100]);

    scale.setDomain(["X", "Y"]);

    expect(scale("X")).toBeCloseTo(0);
    expect(scale("Y")).toBeCloseTo(50);
  });
});

// ── scaleOrdinal ───────────────────────────────────────────────────────────────

describe("scaleOrdinal setDomain / setRange", () => {
  it("should update domain and map to updated positions", () => {
    const scale = scaleOrdinal(["a", "b"], [1, 2]);

    scale.setDomain(["a", "b", "c"]);

    expect(scale.domain()).toEqual(["a", "b", "c"]);
    expect(scale("c")).toBe(1); // cycles: index 2 % 2 = 0 → 1
  });

  it("should update range and produce new mappings", () => {
    const scale = scaleOrdinal(["a", "b"], [1, 2]);

    scale.setRange([10, 20]);

    expect(scale.range()).toEqual([10, 20]);
    expect(scale("a")).toBe(10);
    expect(scale("b")).toBe(20);
  });

  it("should chain setDomain and setRange", () => {
    const scale = scaleOrdinal(["a"], ["red"]);

    scale.setDomain(["a", "b"]).setRange(["blue", "green"]);

    expect(scale("a")).toBe("blue");
    expect(scale("b")).toBe("green");
  });
});

// ── scaleTime ─────────────────────────────────────────────────────────────────

describe("scaleTime setDomain / setRange", () => {
  it("should update domain and remap correctly", () => {
    const d0 = new Date("2024-01-01");
    const d1 = new Date("2024-12-31");
    const d2 = new Date("2025-12-31");
    const scale = scaleTime([d0, d1], [0, 365]);

    scale.setDomain([d0, d2]);

    expect(scale.domain()[0]).toEqual(d0);
    expect(scale.domain()[1]).toEqual(d2);
    // d1 (end of 2024) should now be ~halfway through the new 2-year domain
    const result = scale(d1);
    expect(result).toBeGreaterThan(150);
    expect(result).toBeLessThan(215);
  });

  it("should update range and remap correctly", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2024-12-31");
    const scale = scaleTime([start, end], [0, 365]);

    scale.setRange([0, 1000]);

    expect(scale.range()).toEqual([0, 1000]);
    expect(scale(end)).toBeCloseTo(1000, 0);
  });

  it("should keep invert correct after range update", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const end = new Date("2024-01-01T01:00:00Z");
    const scale = scaleTime([start, end], [0, 60]);

    scale.setRange([0, 3600]);

    const mid = new Date("2024-01-01T00:30:00Z");
    expect(scale.invert(1800).getTime()).toBeCloseTo(mid.getTime(), -3);
  });
});
