import { describe, it, expect } from 'vitest';
import { scaleTime } from '../time';

describe('scaleTime', () => {
  describe('basic mapping', () => {
    it('should map dates to range linearly', () => {
      const start = new Date('2024-01-01T00:00:00Z');
      const end = new Date('2024-12-31T00:00:00Z');
      const scale = scaleTime([start, end], [0, 365]);

      expect(scale(start)).toBeCloseTo(0, 0);
      expect(scale(end)).toBeCloseTo(365, 0);

      const mid = new Date('2024-07-01T00:00:00Z');
      const result = scale(mid);
      expect(result).toBeGreaterThan(170);
      expect(result).toBeLessThan(190);
    });

    it('should handle millisecond precision', () => {
      const start = new Date('2024-01-01T00:00:00.000Z');
      const end = new Date('2024-01-01T00:00:01.000Z');
      const scale = scaleTime([start, end], [0, 1000]);

      const mid = new Date('2024-01-01T00:00:00.500Z');
      expect(scale(mid)).toBe(500);
    });

    it('should handle reversed range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [500, 0]);

      expect(scale(start)).toBeCloseTo(500, 0);
      expect(scale(end)).toBeCloseTo(0, 0);
    });

    it('should handle negative range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [-100, 100]);

      const mid = new Date('2024-07-01');
      const result = scale(mid);
      expect(result).toBeGreaterThan(-20);
      expect(result).toBeLessThan(20);
    });
  });

  describe('edge cases', () => {
    it('should handle same start and end date', () => {
      const date = new Date('2024-01-01');
      const scale = scaleTime([date, date], [0, 100]);

      expect(scale(date)).toBe(0);
    });

    it('should handle dates outside domain without clamping', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]);

      const before = new Date('2023-01-01');
      expect(scale(before)).toBeLessThan(0);

      const after = new Date('2025-12-31');
      expect(scale(after)).toBeGreaterThan(365);
    });

    it('should handle very old dates', () => {
      const start = new Date('1900-01-01');
      const end = new Date('2000-01-01');
      const scale = scaleTime([start, end], [0, 1000]);

      const mid = new Date('1950-01-01');
      const result = scale(mid);
      expect(result).toBeGreaterThan(400);
      expect(result).toBeLessThan(600);
    });

    it('should handle future dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2124-01-01');
      const scale = scaleTime([start, end], [0, 1000]);

      const mid = new Date('2074-01-01');
      const result = scale(mid);
      expect(result).toBeGreaterThan(400);
      expect(result).toBeLessThan(600);
    });

    it('should handle small time ranges', () => {
      const start = new Date('2024-01-01T00:00:00.000Z');
      const end = new Date('2024-01-01T00:00:00.100Z');
      const scale = scaleTime([start, end], [0, 100]);

      const mid = new Date('2024-01-01T00:00:00.050Z');
      expect(scale(mid)).toBe(50);
    });
  });

  describe('clamping', () => {
    it('should clamp dates when enabled', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]).clamp(true);

      const before = new Date('2023-01-01');
      expect(scale(before)).toBe(0);

      const after = new Date('2025-12-31');
      expect(scale(after)).toBe(365);

      const mid = new Date('2024-06-01');
      const result = scale(mid);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(365);
    });

    it('should clamp with reversed range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [365, 0]).clamp(true);

      const before = new Date('2023-01-01');
      expect(scale(before)).toBe(365);

      const after = new Date('2025-12-31');
      expect(scale(after)).toBe(0);
    });

    it('should not clamp when disabled', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]).clamp(false);

      const before = new Date('2023-01-01');
      expect(scale(before)).toBeLessThan(0);

      const after = new Date('2025-12-31');
      expect(scale(after)).toBeGreaterThan(365);
    });

    it('should toggle clamping', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]);

      const future = new Date('2025-12-31');

      expect(scale(future)).toBeGreaterThan(365);

      scale.clamp(true);
      expect(scale(future)).toBe(365);

      scale.clamp(false);
      expect(scale(future)).toBeGreaterThan(365);
    });
  });

  describe('invert', () => {
    it('should invert range to dates', () => {
      const start = new Date('2024-01-01T00:00:00Z');
      const end = new Date('2024-12-31T00:00:00Z');
      const scale = scaleTime([start, end], [0, 365]);

      const inverted = scale.invert?.(0);
      expect(inverted?.getTime()).toBeCloseTo(start.getTime(), -2);

      const invertedEnd = scale.invert?.(365);
      expect(invertedEnd?.getTime()).toBeCloseTo(end.getTime(), -2);
    });

    it('should invert with reversed range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [365, 0]);

      const inverted = scale.invert?.(365);
      expect(inverted?.getTime()).toBeCloseTo(start.getTime(), -2);
    });

    it('should be symmetric with scale', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]);

      const date = new Date('2024-06-15');
      const scaled = scale(date);
      const inverted = scale.invert?.(scaled);

      expect(inverted?.getTime()).toBeCloseTo(date.getTime(), -2);
    });

    it('should handle millisecond precision inversion', () => {
      const start = new Date('2024-01-01T00:00:00.000Z');
      const end = new Date('2024-01-01T00:00:01.000Z');
      const scale = scaleTime([start, end], [0, 1000]);

      const inverted = scale.invert?.(500);
      expect(inverted?.getTime()).toBe(new Date('2024-01-01T00:00:00.500Z').getTime());
    });
  });

  describe('accessors', () => {
    it('should return domain', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]);

      expect(scale.domain()).toEqual([start, end]);
    });

    it('should return range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const scale = scaleTime([start, end], [0, 365]);

      expect(scale.range()).toEqual([0, 365]);
    });


  });

  describe('real-world scenarios', () => {
    it('should work for Gantt chart timeline', () => {
      const projectStart = new Date('2024-01-01');
      const projectEnd = new Date('2024-03-31');
      const scale = scaleTime([projectStart, projectEnd], [0, 1000]);

      const task1Start = new Date('2024-01-15');
      const task1End = new Date('2024-02-15');

      const x1 = scale(task1Start);
      const x2 = scale(task1End);

      expect(x1).toBeGreaterThan(100);
      expect(x2).toBeGreaterThan(x1);
      expect(x2 - x1).toBeGreaterThan(0);
    });

    it('should work for time series chart', () => {
      const start = new Date('2024-01-01T00:00:00Z');
      const end = new Date('2024-01-02T00:00:00Z');
      const scale = scaleTime([start, end], [0, 800]);

      const dataPoints = [
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T06:00:00Z'),
        new Date('2024-01-01T12:00:00Z'),
        new Date('2024-01-01T18:00:00Z'),
        new Date('2024-01-02T00:00:00Z'),
      ];

      const positions = dataPoints.map(d => scale(d));

      // Should be evenly spaced
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]!).toBeGreaterThan(positions[i - 1]!);
      }
    });
  });
});
