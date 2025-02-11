// CacheMixin implementation

const Clear = Symbol("Clear"),
  ClearAll = Symbol("ClearAll"),
  Config = Symbol("Config"),
  OnError = Symbol("OnError"),
  OnEvent = Symbol("OnEvent"),
  SetUniqueIdentifier = Symbol("SetUniqueIdentifier"),
  Enable = Symbol("Enable"),
  Disable = Symbol("Disable");

// Internal symbols (not exported)
const Storage = Symbol("Storage"),
  GetKey = Symbol("GetKey"),
  PurgeOldestAndRetry = Symbol("PurgeOldestAndRetry"),
  CallEvent = Symbol("CallEvent");

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
    #cacheId = "";
    #errorCallback;
    #eventCallback;
    #isCacheDisabled = false;
    #isDuplicatedKey = false;

    get [Storage]() {
      return storage === "local" ? localStorage : sessionStorage;
    }

    [GetKey]() {
      return `${componentName}${this.#cacheId ? "-" + this.#cacheId : ""}`;
    }

    [CallEvent](type, detail = {}) {
      if (this.#eventCallback) {
        this.#eventCallback(type, {
          ...detail,
          componentName,
          key: this[GetKey]()
        });
      }
    }

    /**
     * Registers a callback to handle errors
     */
    [OnError](callback) {
      if (typeof callback === "function") {
        this.#errorCallback = callback;
      }
    }

    /**
     * Registers a callback for cache telemetry events (hit, miss, expire, error)
     */
    [OnEvent](callback) {
      if (typeof callback === "function") {
        this.#eventCallback = callback;
      }
    }

    [SetUniqueIdentifier](id) {
      this.#cacheId = id;
    }

    [Enable]() {
      this.#isCacheDisabled = false;
    }

    [Disable]() {
      this.#isCacheDisabled = true;
    }

    [Config]() {
      if (this.#isCacheDisabled) {
        return;
      }

      const key = this[GetKey]();

      if (componentRegistry.has(key)) {
        this.#isDuplicatedKey = true;
        return;
      }

      componentRegistry.add(key);

      const cacheValue = this[Storage].getItem(key);

      if (!cacheValue) {
        this[CallEvent]("cachemiss");
        return;
      }

      try {
        const cache = JSON.parse(cacheValue);

        if (cache && Date.now() > cache.expiresAt) {
          this[CallEvent]("cacheexpire");
          this[Clear]();
          return;
        }

        if (cache && cache.props) {
          for (const cacheProp of _cacheable) {
            if (Object.prototype.hasOwnProperty.call(cache.props, cacheProp)) {
              this[cacheProp] = cache.props[cacheProp];
            }
          }
          // Update last accessed for LRU
          cache.lastAccessed = Date.now();
          this[Storage].setItem(key, JSON.stringify(cache));
          this[CallEvent]("cachehit");
        }
      } catch (err) {
        if (this.#errorCallback) {
          this.#errorCallback(err);
        }
        this[CallEvent]("cacheerror", { error: err });
      }
    }

    disconnectedCallback() {
      if (this.#isDuplicatedKey || this.#isCacheDisabled) {
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
        const key = this[GetKey]();
        const data = JSON.stringify({
          props,
          expiresAt: Date.now() + expirationTime * 60 * 1000,
          lastAccessed: Date.now()
        });

        try {
          this[Storage].setItem(key, data);
        } catch (err) {
          // Handle QuotaExceededError
          if (
            err.name === "QuotaExceededError" ||
            err.name === "NS_ERROR_DOM_QUOTA_REACHED"
          ) {
            this[PurgeOldestAndRetry](key, data);
          } else if (this.#errorCallback) {
            this.#errorCallback(err);
          }
        }
      }

      componentRegistry.delete(this[GetKey]());

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    [PurgeOldestAndRetry](key, data) {
      const keysForComponent = [];
      const storageInstance = this[Storage];
      for (let i = 0; i < storageInstance.length; i++) {
        const k = storageInstance.key(i);
        if (k === componentName || k.startsWith(`${componentName}-`)) {
          try {
            const val = JSON.parse(storageInstance.getItem(k));
            if (val && val.lastAccessed) {
              keysForComponent.push({ key: k, lastAccessed: val.lastAccessed });
            }
          } catch {
            // Ignore malformed entries
          }
        }
      }

      // Sort by oldest first
      keysForComponent.sort((a, b) => a.lastAccessed - b.lastAccessed);

      // Remove up to 3 oldest entries to make space
      const toRemove = keysForComponent.slice(0, 3);
      toRemove.forEach((item) => storageInstance.removeItem(item.key));

      // Retry once
      try {
        storageInstance.setItem(key, data);
      } catch (retryErr) {
        if (this.#errorCallback) {
          this.#errorCallback(retryErr);
        }
      }
    }

    [Clear]() {
      this[Storage].removeItem(this[GetKey]());
    }

    [ClearAll]() {
      const keysToRemove = [];
      const prefix = `${componentName}-`;
      const storageInstance = this[Storage];
      for (let i = 0; i < storageInstance.length; i++) {
        const k = storageInstance.key(i);
        if (k === componentName || k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => storageInstance.removeItem(k));
    }
  };
};

CacheMixin.Clear = Clear;
CacheMixin.ClearAll = ClearAll;
CacheMixin.Config = Config;
CacheMixin.OnError = OnError;
CacheMixin.OnEvent = OnEvent;
CacheMixin.SetUniqueIdentifier = SetUniqueIdentifier;
CacheMixin.Enable = Enable;
CacheMixin.Disable = Disable;
CacheMixin._registry = componentRegistry;

export { CacheMixin };
