import { LightningElement } from "lwc";

function clone(any) {
  return window.structuredClone
    ? window.structuredClone(any)
    : JSON.parse(JSON.stringify(any));
}

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  typeof value !== "string" ||
  !value?.trim();

function isNotBlank(value) {
  return !isBlank(value);
}

function isObject(value) {
  return (
    typeof value === "object" && value !== null && value.constructor === Object
  );
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

class Mixer {
  base;

  constructor(base = LightningElement) {
    this.base = base;
  }

  mix(...mixins) {
    return mixins.reduce((cls, mixin) => {
      if (mixin instanceof Array) {
        const [mixinFn, params] = mixin;
        return mixinFn(cls, params);
      }
      return mixin(cls);
    }, this.base);
  }
}

function deepMerge(base, overwrite) {
  // Create a clone of base to avoid mutating it directly
  const clonedBase = Object.assign({}, base);

  for (const key of Reflect.ownKeys(overwrite)) {
    const overwriteValue = overwrite[key];
    const baseValue = clonedBase[key];

    if (isObject(overwriteValue)) {
      // If both base and overwrite are objects, merge them
      clonedBase[key] = deepMerge(baseValue || {}, overwriteValue);
    } else {
      // Otherwise, directly assign overwrite value
      clonedBase[key] = overwriteValue;
    }
  }

  return clonedBase;
}

export {
  isBlank,
  clone,
  isNotBlank,
  assert,
  executeAfterRender,
  Mixer,
  deepMerge,
  isObject
};
export { classSet } from "./classSet";
export { classListMutation } from "./classListMutation";
