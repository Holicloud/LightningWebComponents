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

function deepMerge(base, overwrite) {
  // Create a clone of base to avoid mutating it directly
  const clonedBase = Object.assign({}, base);

  for (const key of Reflect.ownKeys(overwrite)) {
    const overwriteValue = overwrite[key];
    const baseValue = clonedBase[key];

    if (
      typeof overwriteValue === "object" &&
      overwriteValue !== null &&
      overwriteValue.constructor === Object
    ) {
      // If both base and overwrite are objects, merge them
      clonedBase[key] = deepMerge(baseValue || {}, overwriteValue);
    } else {
      // Otherwise, directly assign overwrite value
      clonedBase[key] = overwriteValue;
    }
  }

  return clonedBase;
}

export { isBlank, clone, isNotBlank, assert, executeAfterRender, isArrayLike, applyMixings, deepMerge };
export { classSet } from "./classSet";
export { classListMutation } from "./classListMutation";
