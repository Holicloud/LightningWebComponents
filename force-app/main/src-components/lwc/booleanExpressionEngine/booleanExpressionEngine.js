// booleanExpressionEngine.js

const OPERATORS = {
  NOT: { precedence: 3, associativity: "right", arity: 1 },
  AND: { precedence: 2, associativity: "left", arity: 2 },
  OR: { precedence: 1, associativity: "left", arity: 2 }
};

/* =========================
   PUBLIC API
========================= */

/**
 * Strict validator
 * @param {String} expression
 * @param {Number} maxIndex
 */
export function validateExpression(expression, maxIndex) {
  if (!expression || typeof expression !== "string") {
    return { valid: false, message: "Expression is required." };
  }

  if (!Number.isInteger(maxIndex) || maxIndex < 1) {
    return { valid: false, message: "maxIndex must be a positive integer." };
  }

  // 🔥 STRONG FULL STRING VALIDATION
  // Ensures the entire string contains ONLY valid tokens
  const fullTokenRegex = /^(?:\s*(?:\d+|AND|OR|NOT|\(|\))\s*)+$/;

  if (!fullTokenRegex.test(expression)) {
    return {
      valid: false,
      message: "Expression contains invalid characters."
    };
  }

  const tokens = expression.match(/\d+|AND|OR|NOT|\(|\)/g);

  if (!tokens) {
    return { valid: false, message: "Invalid format." };
  }

  let expectOperand = true;
  const stack = [];
  const usedIndexes = new Set();

  for (const token of tokens) {
    // NUMBER
    if (/^\d+$/.test(token)) {
      const num = Number(token);

      if (num < 1 || num > maxIndex) {
        return {
          valid: false,
          message: `Condition ${num} is out of range.`
        };
      }

      if (!expectOperand) {
        return { valid: false, message: "Missing operator." };
      }

      usedIndexes.add(num);
      expectOperand = false;
      continue;
    }

    // NOT
    if (token === "NOT") {
      if (!expectOperand) {
        return { valid: false, message: "NOT cannot appear here." };
      }
      continue;
    }

    // AND / OR
    if (token === "AND" || token === "OR") {
      if (expectOperand) {
        return { valid: false, message: "Operator cannot appear here." };
      }
      expectOperand = true;
      continue;
    }

    // OPEN PAREN
    if (token === "(") {
      if (!expectOperand) {
        return { valid: false, message: "Missing operator before '('." };
      }
      stack.push("(");
      continue;
    }

    // CLOSE PAREN
    if (token === ")") {
      if (expectOperand) {
        return { valid: false, message: "Invalid parentheses usage." };
      }
      if (!stack.length) {
        return { valid: false, message: "Unmatched ')'." };
      }
      stack.pop();
      expectOperand = false;
      continue;
    }

    return { valid: false, message: "Unknown token." };
  }

  if (stack.length) {
    return { valid: false, message: "Unclosed '('." };
  }

  if (expectOperand) {
    return { valid: false, message: "Expression cannot end with operator." };
  }

  // 🔥 STRICT COVERAGE CHECK
  if (usedIndexes.size !== maxIndex) {
    return {
      valid: false,
      message: `Expression must reference exactly conditions 1 through ${maxIndex}.`
    };
  }

  return { valid: true };
}

/**
 * Evaluate expression using values array
 * @param {Boolean[]} values
 * @param {String} expression
 */
export function evaluateExpression(values, expression) {
  if (!Array.isArray(values)) {
    throw new Error("Values must be an array.");
  }

  const validation = validateExpression(expression, values.length);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const rpn = toRPN(expression);
  return evaluateRPN(values, rpn);
}

/* =========================
   INTERNALS
========================= */

function toRPN(expression) {
  const output = [];
  const operatorStack = [];
  const tokens = expression.match(/\d+|AND|OR|NOT|\(|\)/g);

  if (!tokens) {
    throw new Error("Invalid expression.");
  }

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      output.push(token);
      continue;
    }

    if (OPERATORS[token]) {
      const o1 = OPERATORS[token];

      while (operatorStack.length) {
        const top = operatorStack[operatorStack.length - 1];
        if (!OPERATORS[top]) break;

        const o2 = OPERATORS[top];

        const shouldPop =
          (o1.associativity === "left" && o1.precedence <= o2.precedence) ||
          (o1.associativity === "right" && o1.precedence < o2.precedence);

        if (!shouldPop) break;

        output.push(operatorStack.pop());
      }

      operatorStack.push(token);
      continue;
    }

    if (token === "(") {
      operatorStack.push(token);
      continue;
    }

    if (token === ")") {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        output.push(operatorStack.pop());
      }

      if (!operatorStack.length) {
        throw new Error("Mismatched parentheses.");
      }

      operatorStack.pop();
    }
  }

  while (operatorStack.length) {
    const op = operatorStack.pop();
    if (op === "(") {
      throw new Error("Mismatched parentheses.");
    }
    output.push(op);
  }

  return output;
}

function evaluateRPN(values, rpnTokens) {
  const stack = [];

  for (const token of rpnTokens) {
    if (/^\d+$/.test(token)) {
      const index = Number(token) - 1;

      if (index < 0 || index >= values.length) {
        throw new Error(`Index out of range: ${token}`);
      }

      stack.push(values[index]);
      continue;
    }

    if (token === "NOT") {
      const operand = stack.pop();
      stack.push(!operand);
      continue;
    }

    if (token === "AND" || token === "OR") {
      const right = stack.pop();
      const left = stack.pop();

      stack.push(token === "AND" ? left && right : left || right);
    }
  }

  if (stack.length !== 1) {
    throw new Error("Invalid expression.");
  }

  return stack[0];
}
