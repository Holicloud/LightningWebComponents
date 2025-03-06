import { clone, assert, executeAfterRender } from "c/utils";

describe("clone", () => {
  it("should clone an object", () => {
    const obj = { a: 1, b: { c: 2 } };
    const clonedObj = clone(obj);

    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj); // Ensure it's a different reference
  });

  it("should clone an array", () => {
    const arr = [1, 2, { a: 3 }];
    const clonedArr = clone(arr);

    expect(clonedArr).toEqual(arr);
    expect(clonedArr).not.toBe(arr); // Ensure it's a different reference
  });
});

describe("assert", () => {
  it("should not throw an error if condition is true", () => {
    expect(() => assert(true, "This should not throw")).not.toThrow();
  });

  it("should throw an error if condition is false", () => {
    expect(() => assert(false, "This should throw")).toThrow(
      "This should throw"
    );
  });

  it("should throw a default error message if none is provided", () => {
    expect(() => assert(false)).toThrow("Assertion failed");
  });
});

describe("executeAfterRender", () => {
  it("should execute the callback after render", () => {
    jest.useFakeTimers();
    const callback = jest.fn();

    executeAfterRender(callback);

    jest.runAllTimers();
    expect(callback).toHaveBeenCalled();
  });
});
