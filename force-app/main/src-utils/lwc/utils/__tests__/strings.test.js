import { isBlank, isNotBlank, convertToISOString, isValidDate } from "c/utils";

describe("isBlank", () => {
  it("should return true for blank values", () => {
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank(null)).toBe(true);
    expect(isBlank("")).toBe(true);
    expect(isBlank("   ")).toBe(true);
  });

  it("should return false for non-blank values", () => {
    expect(isBlank("string")).toBe(false);
    expect(isBlank("  string  ")).toBe(false);
  });
});

describe("isNotBlank", () => {
  it("should return false for blank values", () => {
    expect(isNotBlank(undefined)).toBe(false);
    expect(isNotBlank(null)).toBe(false);
    expect(isNotBlank("")).toBe(false);
    expect(isNotBlank("   ")).toBe(false);
  });

  it("should return true for non-blank values", () => {
    expect(isNotBlank("string")).toBe(true);
    expect(isNotBlank("  string  ")).toBe(true);
  });
});

describe("convertToISOString", () => {
  it("should convert valid date string to ISO string", () => {
    expect(convertToISOString("2023-01-01")).toBe("2023-01-01T00:00:00.000Z");
  });

  it("should throw an error for invalid date string", () => {
    expect(() => convertToISOString("invalid-date")).toThrow("Invalid Date");
  });
});

describe("isValidDate", () => {
  it("should return true for valid date strings", () => {
    expect(isValidDate("01/01/2023")).toBe(true);
    expect(isValidDate("12/31/2023")).toBe(true);
  });

  it("should return false for invalid date strings", () => {
    expect(isValidDate("13/01/2023")).toBe(false);
    expect(isValidDate("01/32/2023")).toBe(false);
    expect(isValidDate("invalid-date")).toBe(false);
  });
});
