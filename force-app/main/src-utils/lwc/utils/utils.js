function clone(any) {
  return JSON.parse(JSON.stringify(any));
}

function isBlank(value) {
  return !value || value.trim() === "";
}

function isNotBlank(value) {
  return !isBlank(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

class Assert {
  static isNumber(value) {
    assert(Number.isInteger(value), "Has to Be a Number");
  }

  static isArray(value) {
    assert(Array.isArray(value), "Has to Be a Array");
  }

  static assert(condition, message) {
    assert(condition, message);
  }
}

export { isBlank, clone, Assert, isNotBlank };
export { classSet } from "./classSet";
export { classListMutation } from "./classListMutation";
