import { describe, it, expect } from 'vitest';
import { scaleLinear } from '../linear';

describe('scaleLinear', () => {
  describe('basic mapping', () => {
    it('should map domain to range linearly', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale(0)).toBe(0);
      expect(scale(50)).toBe(250);
      expect(scale(100)).toBe(500);
      expect(scale(25)).toBe(125);
      expect(scale(75)).toBe(375);
    });

    it('should handle negative domain values', () => {
      const scale = scaleLinear([-100, 100], [0, 200]);

      expect(scale(-100)).toBe(0);
      expect(scale(0)).toBe(100);
      expect(scale(100)).toBe(200);
      expect(scale(-50)).toBe(50);
    });

    it('should handle negative range values', () => {
      const scale = scaleLinear([0, 100], [-500, 0]);

      expect(scale(0)).toBe(-500);
      expect(scale(50)).toBe(-250);
      expect(scale(100)).toBe(0);
    });

    it('should handle reversed domain', () => {
      const scale = scaleLinear([100, 0], [0, 500]);

      expect(scale(100)).toBe(0);
      expect(scale(50)).toBe(250);
      expect(scale(0)).toBe(500);
    });

    it('should handle reversed range', () => {
      const scale = scaleLinear([0, 100], [500, 0]);

      expect(scale(0)).toBe(500);
      expect(scale(50)).toBe(250);
      expect(scale(100)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle values outside domain without clamping', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale(150)).toBe(750);
      expect(scale(-50)).toBe(-250);
    });

    it('should handle zero-width domain', () => {
      const scale = scaleLinear([50, 50], [0, 100]);

      expect(scale(50)).toBe(0);
      expect(scale(100)).toBe(0);
    });

    it('should handle fractional values', () => {
      const scale = scaleLinear([0, 1], [0, 100]);

      expect(scale(0.5)).toBe(50);
      expect(scale(0.25)).toBe(25);
      expect(scale(0.75)).toBe(75);
    });

    it('should handle very small numbers', () => {
      const scale = scaleLinear([0, 0.001], [0, 1000]);

      expect(scale(0.0005)).toBe(500);
    });

    it('should handle very large numbers', () => {
      const scale = scaleLinear([0, 1_000_000], [0, 100]);

      expect(scale(500_000)).toBe(50);
    });
  });

  describe('clamping', () => {
    it('should clamp values when enabled', () => {
      const scale = scaleLinear([0, 100], [0, 500]).clamp(true);

      expect(scale(150)).toBe(500);
      expect(scale(-50)).toBe(0);
      expect(scale(50)).toBe(250);
    });

    it('should clamp with reversed range', () => {
      const scale = scaleLinear([0, 100], [500, 0]).clamp(true);

      expect(scale(150)).toBe(0);
      expect(scale(-50)).toBe(500);
    });

    it('should not clamp when disabled', () => {
      const scale = scaleLinear([0, 100], [0, 500]).clamp(false);

      expect(scale(150)).toBe(750);
      expect(scale(-50)).toBe(-250);
    });

    it('should toggle clamping', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale(150)).toBe(750);

      scale.clamp(true);
      expect(scale(150)).toBe(500);

      scale.clamp(false);
      expect(scale(150)).toBe(750);
    });
  });

  describe('invert', () => {
    it('should invert range to domain', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale.invert?.(0)).toBe(0);
      expect(scale.invert?.(250)).toBe(50);
      expect(scale.invert?.(500)).toBe(100);
    });

    it('should invert with negative values', () => {
      const scale = scaleLinear([-100, 100], [0, 200]);

      expect(scale.invert?.(0)).toBe(-100);
      expect(scale.invert?.(100)).toBe(0);
      expect(scale.invert?.(200)).toBe(100);
    });

    it('should invert with reversed range', () => {
      const scale = scaleLinear([0, 100], [500, 0]);

      expect(scale.invert?.(500)).toBe(0);
      expect(scale.invert?.(250)).toBe(50);
      expect(scale.invert?.(0)).toBe(100);
    });

    it('should be symmetric with scale', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      const value = 42;
      const scaled = scale(value);
      const inverted = scale.invert?.(scaled);

      expect(inverted).toBeCloseTo(value);
    });
  });

  describe('accessors', () => {
    it('should return domain', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale.domain()).toEqual([0, 100]);
    });

    it('should return range', () => {
      const scale = scaleLinear([0, 100], [0, 500]);

      expect(scale.range()).toEqual([0, 500]);
    });


  });
});
