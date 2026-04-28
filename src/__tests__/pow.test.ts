import { describe, it, expect } from "vitest";
import { scalePow, scaleSqrt } from "../pow";

describe("scalePow", () => {
  describe("exponent 1 (linear equivalent)", () => {
    it("should behave identically to scaleLinear with exponent 1", () => {
      const scale = scalePow([0, 100], [0, 500], 1);

      expect(scale(0)).toBeCloseTo(0);
      expect(scale(50)).toBeCloseTo(250);
      expect(scale(100)).toBeCloseTo(500);
    });
  });

  describe("exponent 2 (quadratic)", () => {
    it("should map domain boundaries correctly", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      expect(scale(0)).toBeCloseTo(0);
      expect(scale(100)).toBeCloseTo(500);
    });

    it("should compress values at the low end", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      // With exponent 2: pow(50)/pow(100) = 2500/10000 = 0.25 → 125
      expect(scale(50)).toBeCloseTo(125);
      expect(scale(50)).toBeLessThan(250); // less than linear midpoint
    });

    it("should handle reversed domain", () => {
      const scale = scalePow([100, 0], [0, 500], 2);

      expect(scale(100)).toBeCloseTo(0);
      expect(scale(0)).toBeCloseTo(500);
    });

    it("should handle values outside domain without clamping", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      expect(scale(200)).toBeGreaterThan(500);
    });
  });

  describe("negative domain", () => {
    it("should handle negative domain values with exponent 2", () => {
      const scale = scalePow([-100, 0], [0, 500], 2);

      expect(scale(-100)).toBeCloseTo(0);
      expect(scale(0)).toBeCloseTo(500);
    });

    it("should preserve sign through power transform", () => {
      const scale = scalePow([-100, 100], [-500, 500], 2);

      expect(scale(-100)).toBeCloseTo(-500);
      expect(scale(0)).toBeCloseTo(0);
      expect(scale(100)).toBeCloseTo(500);
    });
  });

  describe("clamping", () => {
    it("should clamp output to range when enabled", () => {
      const scale = scalePow([0, 100], [0, 500], 2).clamp(true);

      expect(scale(200)).toBe(500);
      expect(scale(-50)).toBe(0);
    });

    it("should not clamp when disabled", () => {
      const scale = scalePow([0, 100], [0, 500], 2).clamp(false);

      expect(scale(200)).toBeGreaterThan(500);
    });

    it("should toggle clamping", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      expect(scale(200)).toBeGreaterThan(500);

      scale.clamp(true);
      expect(scale(200)).toBe(500);

      scale.clamp(false);
      expect(scale(200)).toBeGreaterThan(500);
    });
  });

  describe("invert", () => {
    it("should invert range values back to domain for exponent 2", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      expect(scale.invert(0)).toBeCloseTo(0);
      expect(scale.invert(500)).toBeCloseTo(100);
      expect(scale.invert(125)).toBeCloseTo(50);
    });

    it("should be symmetric with scale", () => {
      const scale = scalePow([0, 100], [0, 500], 3);

      for (const value of [0, 10, 25, 50, 75, 100]) {
        expect(scale.invert(scale(value))).toBeCloseTo(value, 6);
      }
    });

    it("should invert negative domain", () => {
      const scale = scalePow([-100, 100], [-500, 500], 2);

      expect(scale.invert(-500)).toBeCloseTo(-100);
      expect(scale.invert(0)).toBeCloseTo(0);
      expect(scale.invert(500)).toBeCloseTo(100);
    });
  });

  describe("accessors", () => {
    it("should return domain", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      expect(scale.domain()).toEqual([0, 100]);
    });

    it("should return range", () => {
      const scale = scalePow([0, 100], [0, 500], 2);

      expect(scale.range()).toEqual([0, 500]);
    });
  });
});

describe("scaleSqrt", () => {
  it("should be equivalent to scalePow with exponent 0.5", () => {
    const sqrt = scaleSqrt([0, 100], [0, 10]);
    const pow = scalePow([0, 100], [0, 10], 0.5);

    for (const v of [0, 25, 50, 75, 100]) {
      expect(sqrt(v)).toBeCloseTo(pow(v));
    }
  });

  it("should map 0 to range start and max to range end", () => {
    const scale = scaleSqrt([0, 100], [0, 10]);

    expect(scale(0)).toBeCloseTo(0);
    expect(scale(100)).toBeCloseTo(10);
  });

  it("should map quarter domain to half range (sqrt property)", () => {
    const scale = scaleSqrt([0, 100], [0, 10]);

    // sqrt(25) / sqrt(100) = 5/10 = 0.5 → midpoint of range
    expect(scale(25)).toBeCloseTo(5);
  });

  it("should invert correctly", () => {
    const scale = scaleSqrt([0, 100], [0, 10]);

    expect(scale.invert(0)).toBeCloseTo(0);
    expect(scale.invert(5)).toBeCloseTo(25);
    expect(scale.invert(10)).toBeCloseTo(100);
  });

  it("should support clamping", () => {
    const scale = scaleSqrt([0, 100], [0, 10]).clamp(true);

    expect(scale(200)).toBe(10);
    expect(scale(-10)).toBe(0);
  });
});
