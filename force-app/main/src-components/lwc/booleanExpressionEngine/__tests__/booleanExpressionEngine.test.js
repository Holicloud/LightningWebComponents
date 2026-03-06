import {
  validateExpression,
  evaluateExpression
} from "c/booleanExpressionEngine";

describe("c-boolean-expression-engine", () => {
  it("valid simple expressions", () => {
    expect(validateExpression("1 AND 2", 2).valid).toBe(true);
    expect(validateExpression("1 OR 2", 2).valid).toBe(true);
    expect(validateExpression("NOT 1", 1).valid).toBe(true);
    expect(validateExpression("(1 AND 2) OR 3", 3).valid).toBe(true);
  });

  it("invalid syntax", () => {
    expect(validateExpression("AND 1", 1).valid).toBe(false);
    expect(validateExpression("1 OR", 1).valid).toBe(false);
    expect(validateExpression("(1 AND)", 1).valid).toBe(false);
    expect(validateExpression("1 2", 2).valid).toBe(false);
    expect(validateExpression("()", 1).valid).toBe(false);
  });

  it("invalid index range", () => {
    expect(validateExpression("1 AND 3", 2).valid).toBe(false);
  });

  it("parentheses mismatch", () => {
    expect(validateExpression("(1 AND 2", 2).valid).toBe(false);
    expect(validateExpression("1 AND 2)", 2).valid).toBe(false);
  });
});

describe("BooleanExpressionEngine - Evaluation (Basic)", () => {
  it("AND expression", () => {
    expect(evaluateExpression([true, false], "1 AND 2")).toBe(false);
  });

  it("OR expression", () => {
    expect(evaluateExpression([true, false], "1 OR 2")).toBe(true);
  });

  it("NOT expression", () => {
    expect(evaluateExpression([true], "NOT 1")).toBe(false);
  });

  it("single operand", () => {
    expect(evaluateExpression([true], "1")).toBe(true);
  });
});

describe("BooleanExpressionEngine - Complex Expressions", () => {
  const VALUES = [true, false, true, false];

  const TEST_SCENARIOS = [
    { expression: "1 AND 2 OR 3", expected: true },
    { expression: "1 OR 2 AND 3", expected: true },
    { expression: "NOT (1 AND 2)", expected: true },
    { expression: "NOT 1 OR 2", expected: false },
    { expression: "(1 AND 2) OR 3", expected: true },
    { expression: "1 AND (2 OR 3)", expected: true },
    { expression: "(1 OR 2) AND (3 OR 4)", expected: true },
    { expression: "1 OR (2 AND 3)", expected: true },
    { expression: "NOT (1 OR 2) AND 3", expected: false },
    { expression: "1 AND (NOT 2 OR 3)", expected: true }
  ];

  TEST_SCENARIOS.forEach(({ expression, expected }) => {
    // 🔥 Dynamically compute max index used in expression
    const indexes = expression.match(/\d+/g).map(Number);
    const maxIndex = Math.max(...indexes);

    it(`validates strictly: ${expression}`, () => {
      expect(validateExpression(expression, maxIndex).valid).toBe(true);
    });

    it(`evaluates correctly: ${expression}`, () => {
      expect(evaluateExpression(VALUES.slice(0, maxIndex), expression)).toBe(
        expected
      );
    });
  });
});

describe("BooleanExpressionEngine - Error Handling", () => {
  it("throws on invalid index during evaluation", () => {
    expect(() => evaluateExpression([true], "2")).toThrow();
  });

  it("throws on malformed expression", () => {
    expect(() => evaluateExpression([true, false], "1 AND")).toThrow();
  });
});
