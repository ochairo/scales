import { describe, it, expect } from "vitest";
import { scaleLog } from "../log";

describe("scaleLog", () => {
  describe("basic mapping (base 10)", () => {
    it("should map domain boundaries to range boundaries", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      expect(scale(1)).toBeCloseTo(0);
      expect(scale(1000)).toBeCloseTo(300);
    });

    it("should map logarithmically — equal ratios produce equal range steps", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      expect(scale(10)).toBeCloseTo(100);
      expect(scale(100)).toBeCloseTo(200);
      expect(scale(1000)).toBeCloseTo(300);
    });

    it("should handle fractional domain values", () => {
      const scale = scaleLog([0.001, 1], [0, 300]);

      expect(scale(0.001)).toBeCloseTo(0);
      expect(scale(0.01)).toBeCloseTo(100);
      expect(scale(0.1)).toBeCloseTo(200);
      expect(scale(1)).toBeCloseTo(300);
    });

    it("should handle values outside domain without clamping", () => {
      const scale = scaleLog([1, 100], [0, 200]);

      expect(scale(0.1)).toBeLessThan(0);
      expect(scale(1000)).toBeGreaterThan(200);
    });

    it("should handle reversed range", () => {
      const scale = scaleLog([1, 1000], [300, 0]);

      expect(scale(1)).toBeCloseTo(300);
      expect(scale(10)).toBeCloseTo(200);
      expect(scale(100)).toBeCloseTo(100);
      expect(scale(1000)).toBeCloseTo(0);
    });

    it("should handle reversed domain", () => {
      const scale = scaleLog([1000, 1], [0, 300]);

      expect(scale(1000)).toBeCloseTo(0);
      expect(scale(100)).toBeCloseTo(100);
      expect(scale(1)).toBeCloseTo(300);
    });
  });

  describe("custom base", () => {
    it("should map correctly with base 2", () => {
      const scale = scaleLog([1, 8], [0, 300], 2);

      expect(scale(1)).toBeCloseTo(0);
      expect(scale(2)).toBeCloseTo(100);
      expect(scale(4)).toBeCloseTo(200);
      expect(scale(8)).toBeCloseTo(300);
    });

    it("should map correctly with base e (natural log)", () => {
      const scale = scaleLog([1, Math.E ** 3], [0, 300], Math.E);

      expect(scale(1)).toBeCloseTo(0);
      expect(scale(Math.E)).toBeCloseTo(100);
      expect(scale(Math.E ** 2)).toBeCloseTo(200);
      expect(scale(Math.E ** 3)).toBeCloseTo(300);
    });
  });

  describe("negative domain", () => {
    it("should map negative domain values correctly", () => {
      const scale = scaleLog([-1000, -1], [0, 300]);

      expect(scale(-1000)).toBeCloseTo(0);
      expect(scale(-100)).toBeCloseTo(100);
      expect(scale(-10)).toBeCloseTo(200);
      expect(scale(-1)).toBeCloseTo(300);
    });

    it("should preserve logarithmic relationship for negative domain", () => {
      const scale = scaleLog([-100, -1], [0, 200]);

      expect(scale(-100)).toBeCloseTo(0);
      expect(scale(-10)).toBeCloseTo(100);
      expect(scale(-1)).toBeCloseTo(200);
    });
  });

  describe("clamping", () => {
    it("should clamp values below domain minimum", () => {
      const scale = scaleLog([1, 1000], [0, 300]).clamp(true);

      expect(scale(0.01)).toBe(0);
    });

    it("should clamp values above domain maximum", () => {
      const scale = scaleLog([1, 1000], [0, 300]).clamp(true);

      expect(scale(10000)).toBe(300);
    });

    it("should not clamp when disabled", () => {
      const scale = scaleLog([1, 1000], [0, 300]).clamp(false);

      expect(scale(0.01)).toBeLessThan(0);
      expect(scale(10000)).toBeGreaterThan(300);
    });

    it("should toggle clamping", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      expect(scale(10000)).toBeGreaterThan(300);

      scale.clamp(true);
      expect(scale(10000)).toBe(300);

      scale.clamp(false);
      expect(scale(10000)).toBeGreaterThan(300);
    });
  });

  describe("invert", () => {
    it("should invert range values back to domain", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      expect(scale.invert(0)).toBeCloseTo(1);
      expect(scale.invert(100)).toBeCloseTo(10);
      expect(scale.invert(200)).toBeCloseTo(100);
      expect(scale.invert(300)).toBeCloseTo(1000);
    });

    it("should be symmetric with scale", () => {
      const scale = scaleLog([1, 1000], [0, 500]);

      for (const value of [1, 5, 10, 50, 100, 500, 1000]) {
        expect(scale.invert(scale(value))).toBeCloseTo(value, 6);
      }
    });

    it("should invert negative domain", () => {
      const scale = scaleLog([-1000, -1], [0, 300]);

      expect(scale.invert(0)).toBeCloseTo(-1000);
      expect(scale.invert(300)).toBeCloseTo(-1);
    });
  });

  describe("accessors", () => {
    it("should return domain", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      expect(scale.domain()).toEqual([1, 1000]);
    });

    it("should return range", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      expect(scale.range()).toEqual([0, 300]);
    });
  });

  describe("ticks (base 10)", () => {
    it("should generate powers-of-10 ticks for a 3-decade domain", () => {
      const scale = scaleLog([1, 1000], [0, 300]);
      const ticks = scale.ticks(10);

      expect(ticks).toContain(1);
      expect(ticks).toContain(10);
      expect(ticks).toContain(100);
      expect(ticks).toContain(1000);
    });

    it("should include 1-2-5 sub-decade values for base 10", () => {
      const scale = scaleLog([1, 1000], [0, 300]);
      const ticks = scale.ticks(10);

      // Standard log tick pattern: 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000
      expect(ticks).toContain(2);
      expect(ticks).toContain(5);
      expect(ticks).toContain(20);
      expect(ticks).toContain(50);
    });

    it("should generate all 1-9 sub-decade values when count is large", () => {
      const scale = scaleLog([1, 10], [0, 100]);
      const ticks = scale.ticks(10);

      for (let k = 1; k <= 9; k++) {
        expect(ticks).toContain(k);
      }
      expect(ticks).toContain(10);
    });

    it("should return ticks in ascending order for ascending domain", () => {
      const scale = scaleLog([1, 1000], [0, 300]);
      const ticks = scale.ticks();

      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i]!).toBeGreaterThan(ticks[i - 1]!);
      }
    });

    it("should return ticks in descending order for reversed domain", () => {
      const scale = scaleLog([1000, 1], [0, 300]);
      const ticks = scale.ticks();

      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i]!).toBeLessThan(ticks[i - 1]!);
      }
    });

    it("should use only powers for base 2", () => {
      const scale = scaleLog([1, 8], [0, 300], 2);
      const ticks = scale.ticks(5);

      expect(ticks).toContain(1);
      expect(ticks).toContain(2);
      expect(ticks).toContain(4);
      expect(ticks).toContain(8);
    });

    it("should generate ticks within the domain boundaries", () => {
      const scale = scaleLog([1, 1000], [0, 300]);
      const ticks = scale.ticks();

      for (const tick of ticks) {
        expect(tick).toBeGreaterThanOrEqual(1);
        expect(tick).toBeLessThanOrEqual(1000);
      }
    });

    it("should handle negative domain ticks in descending absolute order", () => {
      const scale = scaleLog([-1000, -1], [0, 300]);
      const ticks = scale.ticks();

      for (const tick of ticks) {
        expect(tick).toBeLessThanOrEqual(-1);
        expect(tick).toBeGreaterThanOrEqual(-1000);
      }
      // Should go from most negative to least negative (-1000 → -1)
      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i]!).toBeGreaterThan(ticks[i - 1]!);
      }
    });

    it("should step through powers when decades exceed count", () => {
      const scale = scaleLog([1, 1e10], [0, 1000]);
      const ticks = scale.ticks(5);

      // With 10 decades and count=5, step=2 → every other power
      expect(ticks.length).toBeLessThanOrEqual(7);
    });
  });

  describe("setDomain / setRange", () => {
    it("should update domain in place", () => {
      const scale = scaleLog([1, 100], [0, 200]);

      scale.setDomain([1, 1000]);

      expect(scale.domain()).toEqual([1, 1000]);
      expect(scale(1000)).toBeCloseTo(200);
    });

    it("should update range in place", () => {
      const scale = scaleLog([1, 1000], [0, 300]);

      scale.setRange([0, 600]);

      expect(scale.range()).toEqual([0, 600]);
      expect(scale(1000)).toBeCloseTo(600);
    });
  });
});
