function clone(any) {
  return JSON.parse(JSON.stringify(any));
}

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  typeof value !== "string" ||
  !value?.trim();

function isNotBlank(value) {
  return !isBlank(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function executeAfterRender(callback) {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  setTimeout(callback, 0);
}

function isArrayLike(input) {
  if (Array.isArray(input)) {
    return true;
  }

  if (typeof input === "object" && input !== null) {
    // Check if all keys are numeric and in sequence
    const keys = Object.keys(input);
    return keys.every((key, index) => Number(key) === index);
  }

  return false;
}

function applyMixings(baseClass, ...mixins) {
  for (const mixin of mixins) {
    baseClass = mixin(baseClass);
  }
  return baseClass;
}

export { isBlank, clone, isNotBlank, assert, executeAfterRender, isArrayLike, applyMixings };
export { classSet } from "./classSet";
export { classListMutation } from "./classListMutation";
