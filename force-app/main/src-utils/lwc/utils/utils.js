import { LightningElement } from "lwc";

function clone(value) {
  return window.structuredClone
    ? window.structuredClone(value)
    : JSON.parse(JSON.stringify(value));
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

export { clone, assert, executeAfterRender, Mixer };

export {
  isBlank,
  isNotBlank,
  isValidDate,
  convertToISOString
} from "./strings";
export { isObject, deepMerge } from "./objects";
export { classSet } from "./classSet";
export { CsvProccessor } from "./csv";
export { classListMutation } from "./classListMutation";
