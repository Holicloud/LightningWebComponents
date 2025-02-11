import {
  isNotBlank,
  assert,
  isBlank,
  isLightningElementSubclass
} from "c/utils";
import { api } from "lwc";
const Clear = Symbol("Clear"),
  Config = Symbol("Config");

const DEFAULT_CACHE_PROPS = Object.freeze(["cache"]);
const DEFAULT_EXPIRATION_TIME = 60;

const componentReference = new Set();

const SessionStorageMixin = (
  Base,
  {
    cacheable = DEFAULT_CACHE_PROPS,
    expirationTime = DEFAULT_EXPIRATION_TIME,
    componentName
  }
) => {
  isLightningElementSubclass(Base);
  assert(isNotBlank(componentName), "componentName is required");
  assert(cacheable instanceof Array, "cache prop has to be an array");
  cacheable = cacheable.length ? cacheable : DEFAULT_CACHE_PROPS;

  return class extends Base {
    @api cacheId;

    #getKey = () => {
      return `${componentName}${isNotBlank(this.cacheId) ? "-" + this.cacheId : ""}`;
    };

    #isDuplicatedKey = false;

    [Config]() {
      const key = this.#getKey();

      if (componentReference.has(key)) {
        this.#isDuplicatedKey = true;
        return;
      }

      componentReference.add(key);

      const cacheValue = sessionStorage.getItem(key);

      if (isBlank(cacheValue)) {
        return;
      }

      const cache = JSON.parse(cacheValue);

      if (cache && Date.now() > cache.expiresAt) {
        this[Clear]();
        return;
      }

      for (const cacheProp of cacheable) {
        this[cacheProp] = cache.props[cacheProp];
      }

      this[Clear]();
    }

    disconnectedCallback() {
      if (this.#isDuplicatedKey) {
        return;
      }

      const props = {};

      for (const cacheProp of cacheable) {
        props[cacheProp] = this[cacheProp];
      }

      sessionStorage.setItem(
        this.#getKey(),
        JSON.stringify({
          props,
          expiresAt: Date.now() + expirationTime * 60 * 1000
        })
      );

      componentReference.delete(this.#getKey());

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    [Clear]() {
      sessionStorage.removeItem(this.#getKey());
    }
  };
};

SessionStorageMixin.Config = Config;

export { SessionStorageMixin };
