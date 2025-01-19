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

export { isBlank, clone, isNotBlank, assert };
export { classSet } from "./classSet";
export { classListMutation } from "./classListMutation";
