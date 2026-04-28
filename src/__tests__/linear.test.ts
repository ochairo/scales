import { describe, it, expect } from "vitest";
import { scaleLinear } from "../linear";

describe("scaleLinear", () => {
  describe("basic mapping", () => {
    it("should map domain to range linearly", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale(0)).toBe(0);
      expect(scale(50)).toBe(250);
      expect(scale(100)).toBe(500);
      expect(scale(25)).toBe(125);
      expect(scale(75)).toBe(375);
    });

    it("should handle negative domain values", () => {
      const scale = scaleLinear([-100, 100], [0, 200]);

      expect(scale(-100)).toBe(0);
      expect(scale(0)).toBe(100);
      expect(scale(100)).toBe(200);
      expect(scale(-50)).toBe(50);
    });

    it("should handle negative range values", () => {
      const scale = scaleLinear([0, 100], [-500, 0]);

      expect(scale(0)).toBe(-500);
      expect(scale(50)).toBe(-250);
      expect(scale(100)).toBe(0);
    });

    it("should handle reversed domain", () => {
      const scale = scaleLinear([100, 0], [0, 500]);

      expect(scale(100)).toBe(0);
      expect(scale(50)).toBe(250);
      expect(scale(0)).toBe(500);
    });

    it("should handle reversed range", () => {
      const scale = scaleLinear([0, 100], [500, 0]);

      expect(scale(0)).toBe(500);
      expect(scale(50)).toBe(250);
      expect(scale(100)).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle values outside domain without clamping", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale(150)).toBe(750);
      expect(scale(-50)).toBe(-250);
    });

    it("should handle zero-width domain", () => {
      const scale = scaleLinear([50, 50], [0, 100]);

      expect(scale(50)).toBe(0);
      expect(scale(100)).toBe(0);
    });

    it("should handle fractional values", () => {
      const scale = scaleLinear([0, 1], [0, 100]);

      expect(scale(0.5)).toBe(50);
      expect(scale(0.25)).toBe(25);
      expect(scale(0.75)).toBe(75);
    });

    it("should handle very small numbers", () => {
      const scale = scaleLinear([0, 0.001], [0, 1000]);

      expect(scale(0.0005)).toBe(500);
    });

    it("should handle very large numbers", () => {
      const scale = scaleLinear([0, 1_000_000], [0, 100]);

      expect(scale(500_000)).toBe(50);
    });
  });

  describe("clamping", () => {
    it("should clamp values when enabled", () => {
      const scale = scaleLinear([0, 100], [0, 500]).clamp(true);

      expect(scale(150)).toBe(500);
      expect(scale(-50)).toBe(0);
      expect(scale(50)).toBe(250);
    });

    it("should clamp with reversed range", () => {
      const scale = scaleLinear([0, 100], [500, 0]).clamp(true);

      expect(scale(150)).toBe(0);
      expect(scale(-50)).toBe(500);
    });

    it("should not clamp when disabled", () => {
      const scale = scaleLinear([0, 100], [0, 500]).clamp(false);

      expect(scale(150)).toBe(750);
      expect(scale(-50)).toBe(-250);
    });

    it("should toggle clamping", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale(150)).toBe(750);

      scale.clamp(true);
      expect(scale(150)).toBe(500);

      scale.clamp(false);
      expect(scale(150)).toBe(750);
    });
  });

  describe("invert", () => {
    it("should invert range to domain", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale.invert?.(0)).toBe(0);
      expect(scale.invert?.(250)).toBe(50);
      expect(scale.invert?.(500)).toBe(100);
    });

    it("should invert with negative values", () => {
      const scale = scaleLinear([-100, 100], [0, 200]);

      expect(scale.invert?.(0)).toBe(-100);
      expect(scale.invert?.(100)).toBe(0);
      expect(scale.invert?.(200)).toBe(100);
    });

    it("should invert with reversed range", () => {
      const scale = scaleLinear([0, 100], [500, 0]);

      expect(scale.invert?.(500)).toBe(0);
      expect(scale.invert?.(250)).toBe(50);
      expect(scale.invert?.(0)).toBe(100);
    });

    it("should be symmetric with scale", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      const value = 42;
      const scaled = scale(value);
      const inverted = scale.invert?.(scaled);

      expect(inverted).toBeCloseTo(value);
    });
  });

  describe("accessors", () => {
    it("should return domain", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale.domain()).toEqual([0, 100]);
    });

    it("should return range", () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale.range()).toEqual([0, 500]);
    });
  });

  describe("ticks", () => {
    it("should generate ~10 evenly spaced ticks by default", () => {
      const scale = scaleLinear([0, 100], [0, 500]);
      const ticks = scale.ticks();

      expect(ticks.length).toBeGreaterThanOrEqual(8);
      expect(ticks.length).toBeLessThanOrEqual(12);
      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBe(100);
    });

    it("should include domain boundaries", () => {
      const scale = scaleLinear([0, 100], [0, 500]);
      const ticks = scale.ticks(5);

      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBe(100);
    });

    it("should generate ticks with nice round steps", () => {
      const scale = scaleLinear([0, 100], [0, 500]);
      const ticks = scale.ticks(10);

      // All ticks should be multiples of the step
      const step = ticks[1] - ticks[0];
      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i] - ticks[i - 1]).toBeCloseTo(step, 6);
      }
    });

    it("should generate fewer ticks when count is small", () => {
      const scale = scaleLinear([0, 100], [0, 500]);
      const ticks = scale.ticks(5);

      expect(ticks.length).toBeGreaterThanOrEqual(4);
      expect(ticks.length).toBeLessThanOrEqual(6);
    });

    it("should handle reversed domain", () => {
      const scale = scaleLinear([100, 0], [0, 500]);
      const ticks = scale.ticks(5);

      // Ticks should go from high to low
      expect(ticks[0]).toBeGreaterThan(ticks[ticks.length - 1]);
    });

    it("should work with non-zero start", () => {
      const scale = scaleLinear([1000, 2000], [0, 500]);
      const ticks = scale.ticks(5);

      expect(ticks[0]).toBeGreaterThanOrEqual(1000);
      expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(2000);
    });
  });

  describe("nice", () => {
    it("should round domain to nice boundaries", () => {
      const scale = scaleLinear([0.5, 99.5], [0, 500]);
      scale.nice();

      const [min, max] = scale.domain();
      expect(min).toBeLessThanOrEqual(0.5);
      expect(max).toBeGreaterThanOrEqual(99.5);
    });

    it("should produce round numbers at boundaries", () => {
      const scale = scaleLinear([1.3, 98.7], [0, 500]);
      scale.nice(10);

      const [min, max] = scale.domain();
      // Round domain values are divisible by the tick step
      expect(min % 10).toBe(0);
      expect(max % 10).toBe(0);
    });

    it("should expand domain, not shrink it", () => {
      const scale = scaleLinear([5, 95], [0, 500]);
      scale.nice(10);

      const [min, max] = scale.domain();
      expect(min).toBeLessThanOrEqual(5);
      expect(max).toBeGreaterThanOrEqual(95);
    });

    it("should update ticks after nice()", () => {
      const scale = scaleLinear([1.5, 98.5], [0, 500]);
      const beforeTicks = scale.ticks();
      scale.nice();
      const afterTicks = scale.ticks();

      expect(afterTicks[0]).toBeLessThanOrEqual(beforeTicks[0]);
      expect(afterTicks[afterTicks.length - 1]).toBeGreaterThanOrEqual(
        beforeTicks[beforeTicks.length - 1],
      );
    });

    it("should be chainable after construction", () => {
      const scale = scaleLinear([1.3, 98.7], [0, 500]);
      scale.nice(5);

      // Scale still works after nice()
      expect(scale(0)).toBeLessThanOrEqual(0);
      expect(scale(100)).toBeGreaterThanOrEqual(500);
    });
  });
});
