import { LightningElement } from "lwc";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function clone(value) {
  return window.structuredClone
    ? window.structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

export { clone, assert, Mixer };

export {
  isBlank,
  isNotBlank,
  isValidDate,
  convertToISOString
} from "./strings";
export { isObject, deepMerge, flattenObject } from "./objects";
export { classSet } from "./classSet";
export { CsvProccessor } from "./csv";
export { classListMutation } from "./classListMutation";

class Mixer {
  base;

  mix(...mixins) {
    return mixins.reduce((cls, mixin) => {
      if (mixin instanceof Array) {
        const [mixinFn, params] = mixin;
        return mixinFn(cls, params);
      }
      return mixin(cls);
    }, this.base);
  }

  constructor(base = LightningElement) {
    this.base = base;
  }
}
