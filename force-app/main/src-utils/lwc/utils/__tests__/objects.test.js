import { isObject, deepMerge } from "c/utils";

describe("isObject", () => {
  it("should return true for plain objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: "value" })).toBe(true);
  });

  it("should return false for non-objects", () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject("string")).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(() => {})).toBe(false);
  });
});

describe("deepMerge", () => {
  it("should merge two objects deeply", () => {
    const base = { a: 1, b: { c: 2 } };
    const overwrite = { b: { d: 3 }, e: 4 };
    const result = deepMerge(base, overwrite);

    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  it("should not mutate the base object", () => {
    const base = { a: 1, b: { c: 2 } };
    const overwrite = { b: { d: 3 }, e: 4 };
    deepMerge(base, overwrite);

    expect(base).toEqual({ a: 1, b: { c: 2 } });
  });

  it("should handle non-object values in overwrite", () => {
    const base = { a: 1, b: { c: 2 } };
    const overwrite = { b: 3, e: 4 };
    const result = deepMerge(base, overwrite);

    expect(result).toEqual({ a: 1, b: 3, e: 4 });
  });

  it("should handle empty base object", () => {
    const base = {};
    const overwrite = { a: 1, b: { c: 2 } };
    const result = deepMerge(base, overwrite);

    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });

  it("should handle empty overwrite object", () => {
    const base = { a: 1, b: { c: 2 } };
    const overwrite = {};
    const result = deepMerge(base, overwrite);

    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });
});
