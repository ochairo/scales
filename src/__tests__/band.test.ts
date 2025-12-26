import { describe, it, expect } from 'vitest';
import { scaleBand } from '../band';

describe('scaleBand', () => {
  describe('basic mapping', () => {
    it('should map domain values to band positions', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

      expect(scale('A')).toBe(0);
      expect(scale('B')).toBe(100);
      expect(scale('C')).toBe(200);
    });

    it('should return NaN for unknown domain values', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

      expect(scale('D' as any)).toBe(Number.NaN);
      expect(scale('Z' as any)).toBe(Number.NaN);
    });

    it('should work with numeric domain', () => {
      const scale = scaleBand([1, 2, 3, 4], [0, 400]);

      expect(scale(1)).toBe(0);
      expect(scale(2)).toBe(100);
      expect(scale(3)).toBe(200);
      expect(scale(4)).toBe(300);
    });

    it('should handle single domain value', () => {
      const scale = scaleBand(['A'], [0, 100]);

      expect(scale('A')).toBe(0);
      expect(scale.bandwidth()).toBe(100);
    });

    it('should handle empty domain', () => {
      const scale = scaleBand([], [0, 100]);

      expect(scale('A' as never)).toBe(Number.NaN);
      expect(scale.bandwidth()).toBe(0);
      expect(scale.step()).toBe(0);
    });
  });

  describe('bandwidth', () => {
    it('should calculate bandwidth correctly', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

      expect(scale.bandwidth()).toBe(100);
    });

    it('should calculate bandwidth with padding', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]).padding(0.2);

      // With padding, bandwidth is reduced
      expect(scale.bandwidth()).toBeCloseTo(75);
    });

    it('should return zero bandwidth for empty domain', () => {
      const scale = scaleBand([], [0, 300]);

      expect(scale.bandwidth()).toBe(0);
    });
  });

  describe('step', () => {
    it('should calculate step correctly', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

      expect(scale.step()).toBe(100);
    });

    it('should calculate step with padding', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]).padding(0.2);

      // Step includes padding
      expect(scale.step()).toBeCloseTo(93.75);
    });
  });

  describe('padding', () => {
    it('should apply uniform padding', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]).padding(0.1);

      const positions = ['A', 'B', 'C'].map(v => scale(v));

      // Positions should be evenly spaced
      expect(positions[1]! - positions[0]!).toBeCloseTo(positions[2]! - positions[1]!);

      // First position should be offset from start
      expect(positions[0]).toBeGreaterThan(0);
    });

    it('should apply inner padding only', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]).paddingInner(0.2);

      // First position should start at 0 (no outer padding)
      expect(scale('A')).toBe(0);

      // Bandwidth should be reduced by inner padding
      expect(scale.bandwidth()).toBeCloseTo(85.71, 2);
    });

    it('should apply outer padding only', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]).paddingOuter(0.5);

      // First position should be offset (outer padding)
      expect(scale('A')).toBeGreaterThan(0);

      // Bandwidth should remain at full step width (no inner padding)
      const step = scale.step();
      expect(scale.bandwidth()).toBe(step);
    });

    it('should apply both inner and outer padding independently', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300])
        .paddingInner(0.2)
        .paddingOuter(0.5);

      expect(scale('A')).toBeGreaterThan(0);
      expect(scale.bandwidth()).toBeLessThan(scale.step());
    });

    it('should handle zero padding', () => {
      const scale = scaleBand(['A', 'B'], [0, 200]).padding(0);

      expect(scale('A')).toBe(0);
      expect(scale('B')).toBe(100);
      expect(scale.bandwidth()).toBe(100);
    });

    it('should handle maximum padding', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]).padding(1);

      // With full padding, bandwidth becomes very small
      expect(scale.bandwidth()).toBeCloseTo(0);
    });
  });

  describe('reversed range', () => {
    it('should handle reversed range', () => {
      const scale = scaleBand(['A', 'B', 'C'], [300, 0]);

      expect(scale('A')).toBe(300);
      expect(scale('B')).toBe(200);
      expect(scale('C')).toBe(100);
    });

    it('should calculate bandwidth correctly with reversed range', () => {
      const scale = scaleBand(['A', 'B', 'C'], [300, 0]);

      expect(scale.bandwidth()).toBe(100);
    });

    it('should handle padding with reversed range', () => {
      const scale = scaleBand(['A', 'B', 'C'], [300, 0]).padding(0.1);

      const positions = ['A', 'B', 'C'].map(v => scale(v));

      // Should be descending
      expect(positions[0]!).toBeGreaterThan(positions[1]!);
      expect(positions[1]!).toBeGreaterThan(positions[2]!);
    });
  });

  describe('edge cases', () => {
    it('should handle negative range', () => {
      const scale = scaleBand(['A', 'B'], [-200, -100]);

      expect(scale('A')).toBe(-200);
      expect(scale('B')).toBe(-150);
      expect(scale.bandwidth()).toBe(50);
    });

    it('should handle fractional positions', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 100]);

      expect(scale('A')).toBeCloseTo(0);
      expect(scale('B')).toBeCloseTo(33.333, 2);
      expect(scale('C')).toBeCloseTo(66.667, 2);
    });

    it('should handle many domain values', () => {
      const domain = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const scale = scaleBand(domain, [0, 1000]);

      expect(scale('item-0')).toBe(0);
      expect(scale('item-50')).toBe(500);
      expect(scale('item-99')).toBe(990);
      expect(scale.bandwidth()).toBe(10);
    });
  });

  describe('accessors', () => {
    it('should return domain', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

      expect(scale.domain()).toEqual(['A', 'B', 'C']);
    });

    it('should return range', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

      expect(scale.range()).toEqual([0, 300]);
    });


  });

  describe('chaining', () => {
    it('should allow method chaining', () => {
      const scale = scaleBand(['A', 'B', 'C'], [0, 300])
        .padding(0.1)
        .paddingInner(0.2)
        .paddingOuter(0.5);

      expect(scale('A')).toBeGreaterThan(0);
      expect(typeof scale.bandwidth()).toBe('number');
    });
  });
});
