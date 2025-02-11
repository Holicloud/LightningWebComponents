import { api } from "lwc";

const Clear = Symbol("Clear"),
  Config = Symbol("Config"),
  OnError = Symbol("OnError");

const DEFAULT_CACHE_PROPS = Object.freeze(["cache"]);
const DEFAULT_EXPIRATION_TIME = 60;
const VALID_STORAGE_TYPES = Object.freeze(["session", "local"]);

/**
 * Shared registry to prevent multiple active components from stepping on each other's cache keys
 * within the same page session.
 */
const componentRegistry = new Set();

const CacheMixin = (
  Base,
  {
    cacheable = DEFAULT_CACHE_PROPS,
    componentName,
    expirationTime = DEFAULT_EXPIRATION_TIME,
    storage = "session"
  }
) => {
  if (typeof Base?.prototype?.dispatchEvent !== "function") {
    throw new TypeError(`${Base} must be an Element type`);
  }
  if (
    !componentName ||
    typeof componentName !== "string" ||
    !componentName.trim()
  ) {
    throw new Error("componentName is required");
  }
  if (!(cacheable instanceof Array)) {
    throw new Error("cacheable must be an array");
  }
  if (!VALID_STORAGE_TYPES.includes(storage)) {
    throw new Error('storage must be "session" or "local"');
  }

  const _cacheable = cacheable.length ? cacheable : DEFAULT_CACHE_PROPS;

  return class extends Base {
    @api cacheId;
    @api isCacheDisabled = false;

    _errorCallback;
    _isDuplicatedKey = false;

    get _storage() {
      return storage === "local" ? localStorage : sessionStorage;
    }

    _getKey() {
      return `${componentName}${this.cacheId ? "-" + this.cacheId : ""}`;
    }

    /**
     * Registers a callback to handle errors (e.g. JSON parsing failures)
     * Similar to empApi.onError
     */
    [OnError](callback) {
      if (typeof callback === "function") {
        this._errorCallback = callback;
      }
    }

    [Config]() {
      if (this.isCacheDisabled) {
        return;
      }

      const key = this._getKey();

      if (componentRegistry.has(key)) {
        this._isDuplicatedKey = true;
        return;
      }

      componentRegistry.add(key);

      const cacheValue = this._storage.getItem(key);

      if (!cacheValue) {
        return;
      }

      try {
        const cache = JSON.parse(cacheValue);

        if (cache && Date.now() > cache.expiresAt) {
          this[Clear]();
          return;
        }

        if (cache && cache.props) {
          for (const cacheProp of _cacheable) {
            if (Object.prototype.hasOwnProperty.call(cache.props, cacheProp)) {
              this[cacheProp] = cache.props[cacheProp];
            }
          }
        }
      } catch (err) {
        if (this._errorCallback) {
          this._errorCallback(err);
        }
        // Also dispatch standard event for parent components
        this.dispatchEvent(
          new CustomEvent("cacheerror", {
            detail: { error: err, key, componentName }
          })
        );
      }
    }

    disconnectedCallback() {
      if (this._isDuplicatedKey || this.isCacheDisabled) {
        return;
      }

      const props = {};
      let hasData = false;

      for (const cacheProp of _cacheable) {
        if (this[cacheProp] !== undefined) {
          props[cacheProp] = this[cacheProp];
          hasData = true;
        }
      }

      if (hasData) {
        try {
          this._storage.setItem(
            this._getKey(),
            JSON.stringify({
              props,
              expiresAt: Date.now() + expirationTime * 60 * 1000
            })
          );
        } catch (err) {
          if (this._errorCallback) {
            this._errorCallback(err);
          }
        }
      }

      componentRegistry.delete(this._getKey());

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    [Clear]() {
      this._storage.removeItem(this._getKey());
    }
  };
};

CacheMixin.Clear = Clear;
CacheMixin.Config = Config;
CacheMixin.OnError = OnError;
CacheMixin._registry = componentRegistry;

export { CacheMixin };
