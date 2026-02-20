import { describe, expect, it } from "vitest";
import { remove } from "./array";

describe("array", () => {
  describe("remove", () => {
    it("removes item from array", () => {
      const result = remove([1, 2, 3, 4, 5], 1);
      expect(result).toEqual([1, 3, 4, 5]);
    });
  });
});
