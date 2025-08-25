import { isObject, deepMerge, flattenObject } from "c/utils";

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

describe("flattenObject", () => {
  test("flattens a simple nested object", () => {
    const input = { a: { b: { c: 1 } } };
    const result = flattenObject(input);
    expect(result).toEqual({ "a.b.c": 1 });
  });

  test("handles multiple nested props", () => {
    const input = { user: { name: "John", age: 30 } };
    const result = flattenObject(input);
    expect(result).toEqual({
      "user.name": "John",
      "user.age": 30
    });
  });

  test("leaves top-level props intact", () => {
    const input = { a: 1, b: { c: 2 } };
    const result = flattenObject(input);
    expect(result).toEqual({ a: 1, "b.c": 2 });
  });

  test("handles empty object", () => {
    const input = {};
    const result = flattenObject(input);
    expect(result).toEqual({});
  });

  test("ignores arrays (treats them as values)", () => {
    const input = { list: [1, 2, 3] };
    const result = flattenObject(input);
    expect(result).toEqual({ list: [1, 2, 3] });
  });

  test("ignores null values", () => {
    const input = { a: null, b: { c: null } };
    const result = flattenObject(input);
    expect(result).toEqual({ a: null, "b.c": null });
  });

  test("does not mutate original object", () => {
    const input = { a: { b: 2 } };
    const copy = JSON.parse(JSON.stringify(input)); // snapshot
    flattenObject(input);
    expect(input).toEqual(copy);
  });

  test("flattens with custom separator", () => {
    const input = { a: { b: { c: 1 } }, d: 2 };
    const result = flattenObject(input, "/");
    expect(result).toEqual({ "a/b/c": 1, d: 2 });
  });
});
