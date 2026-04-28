import { describe, it, expect } from "vitest";
import { scaleOrdinal } from "../ordinal";

describe("scaleOrdinal", () => {
  describe("basic mapping", () => {
    it("should map domain values to corresponding range values", () => {
      const scale = scaleOrdinal(["a", "b", "c"], [1, 2, 3]);

      expect(scale("a")).toBe(1);
      expect(scale("b")).toBe(2);
      expect(scale("c")).toBe(3);
    });

    it("should work with string range (colors)", () => {
      const scale = scaleOrdinal(
        ["apples", "bananas", "cherries"],
        ["#ff0000", "#ffff00", "#ff00ff"],
      );

      expect(scale("apples")).toBe("#ff0000");
      expect(scale("bananas")).toBe("#ffff00");
      expect(scale("cherries")).toBe("#ff00ff");
    });

    it("should work with numeric domain", () => {
      const scale = scaleOrdinal([10, 20, 30], ["a", "b", "c"]);

      expect(scale(10)).toBe("a");
      expect(scale(20)).toBe("b");
      expect(scale(30)).toBe("c");
    });

    it("should work with single item", () => {
      const scale = scaleOrdinal(["x"], ["only"]);

      expect(scale("x")).toBe("only");
    });
  });

  describe("unknown values", () => {
    it("should return undefined for values not in domain by default", () => {
      const scale = scaleOrdinal(["a", "b"], [1, 2]);

      expect(scale("c")).toBeUndefined();
      expect(scale("z")).toBeUndefined();
    });

    it("should return configured unknown value via setUnknown()", () => {
      const scale = scaleOrdinal(["a", "b"], [1, 2]).setUnknown(-1);

      expect(scale("c")).toBe(-1);
      expect(scale("z")).toBe(-1);
    });

    it("should return unknown() as undefined initially", () => {
      const scale = scaleOrdinal(["a"], ["x"]);

      expect(scale.unknown()).toBeUndefined();
    });

    it("should return the configured unknown value from unknown()", () => {
      const scale = scaleOrdinal(["a"], ["x"]).setUnknown("fallback");

      expect(scale.unknown()).toBe("fallback");
    });

    it("setUnknown() should be chainable (returns scale)", () => {
      const scale = scaleOrdinal(["a", "b"], [1, 2]).setUnknown(0);

      expect(scale("a")).toBe(1);
      expect(scale("unknown")).toBe(0);
    });
  });

  describe("range cycling", () => {
    it("should cycle range values when domain is longer than range", () => {
      const scale = scaleOrdinal([1, 2, 3, 4], ["a", "b"]);

      expect(scale(1)).toBe("a");
      expect(scale(2)).toBe("b");
      expect(scale(3)).toBe("a"); // cycles back
      expect(scale(4)).toBe("b");
    });

    it("should cycle correctly with 3-item range", () => {
      const scale = scaleOrdinal([1, 2, 3, 4, 5, 6], ["x", "y", "z"]);

      expect(scale(1)).toBe("x");
      expect(scale(2)).toBe("y");
      expect(scale(3)).toBe("z");
      expect(scale(4)).toBe("x");
      expect(scale(5)).toBe("y");
      expect(scale(6)).toBe("z");
    });

    it("should work when range is longer than domain", () => {
      const scale = scaleOrdinal(["a", "b"], [10, 20, 30, 40]);

      expect(scale("a")).toBe(10);
      expect(scale("b")).toBe(20);
      // Extra range values unused
    });
  });

  describe("empty inputs", () => {
    it("should return undefined for any value with empty domain", () => {
      const scale = scaleOrdinal([], ["x", "y"]);

      expect(scale("anything" as never)).toBeUndefined();
    });

    it("should return undefined for any value with empty range", () => {
      const scale = scaleOrdinal(["a", "b"], []);

      expect(scale("a")).toBeUndefined();
    });
  });

  describe("accessors", () => {
    it("should return domain", () => {
      const scale = scaleOrdinal(["a", "b", "c"], [1, 2, 3]);

      expect(scale.domain()).toEqual(["a", "b", "c"]);
    });

    it("should return range", () => {
      const scale = scaleOrdinal(["a", "b"], ["red", "blue"]);

      expect(scale.range()).toEqual(["red", "blue"]);
    });
  });
});
