import { classSet } from "c/utils";

describe("classSet", () => {
  it("should create a classSet from a string", () => {
    const result = classSet("class-a");
    expect(result.toString()).toBe("class-a");
  });

  it("should create a classSet from an object", () => {
    const result = classSet({ "class-a": true, "class-b": false });
    expect(result.toString()).toBe("class-a");
  });

  it("should add classes using add method", () => {
    const result = classSet({ "class-a": true });
    result.add("class-b");
    expect(result.toString()).toBe("class-a class-b");
  });

  it("should invert classes using invert method", () => {
    const result = classSet({ "class-a": true, "class-b": false });
    result.invert();
    expect(result.toString()).toBe("class-b");
  });

  it("should handle adding multiple classes using add method", () => {
    const result = classSet({ "class-a": true });
    result.add({ "class-b": true, "class-c": false });
    expect(result.toString()).toBe("class-a class-b");
  });
});
