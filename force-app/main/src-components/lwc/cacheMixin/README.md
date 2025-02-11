# CacheMixin

A robust, reusable Lightning Web Component mixin for standardizing client-side state persistence. It supports both `sessionStorage` and `localStorage` backends and handles lifecycle-based data restoration and cleanup.

## Features

- **Configurable Storage**: Choose between `session` (default) or `local` storage.
- **Symbol-based API**: Ensures no property collisions with your component's internal logic.
- **Duplicate Key Protection**: Prevents multiple active instances of the same component (with the same `cacheId`) from overwriting each other's cache.
- **Expiration Support**: Automatically expires cache entries after a configurable time (default 60 minutes).
- **On/Off Toggle**: Support for standard `@api isCacheDisabled` property to dynamically disable caching.
- **Error Handling**: Register an error callback via `[CacheMixin.OnError]` to handle JSON parsing failures or storage quota issues.

## Usage

### 1. Basic Implementation (Session Storage)

```javascript
import { CacheMixin } from "c/cacheMixin";
import { LightningElement } from "lwc";

export default class MyComponent extends CacheMixin(LightningElement, {
  componentName: "myComponent",
  cacheable: ["firstName", "lastName"],
  storage: "session"
}) {
  firstName = "";
  lastName = "";

  connectedCallback() {
    // Cache is enabled by default (isCacheDisabled = false)
    // To disable: this.isCacheDisabled = true;

    // Optional: Error handling
    this[CacheMixin.OnError]((error) => {
      console.error("Cache Error:", error);
    });

    // Restore state
    this[CacheMixin.Config]();
  }
}
```

### 2. Local Storage Implementation (Persistent)

```javascript
export default class MyPersistentComponent extends CacheMixin(
  LightningElement,
  {
    componentName: "myPersistentComponent",
    cacheable: ["userPreferences"],
    storage: "local",
    expirationTime: 1440 // 24 hours
  }
) {
  // ...
}
```

## API Reference

### Configuration Options

| Property         | Type                   | Default      | Description                                 |
| ---------------- | ---------------------- | ------------ | ------------------------------------------- |
| `componentName`  | `string`               | **Required** | A unique identifier for the component type. |
| `cacheable`      | `string[]`             | `['cache']`  | List of property names to be persisted.     |
| `storage`        | `'session' \| 'local'` | `'session'`  | The storage backend to use.                 |
| `expirationTime` | `number`               | `60`         | Cache life in minutes.                      |

### Mixin Properties (Internal/Overridable)

- `cacheId`: (String) Optional instance-specific identifier (e.g. Record Id) to differentiate storage keys between instances of the same component.
- `isCacheDisabled`: (Boolean) Set to `true` to disable caching logic. Defaults to `false` (enabled).

### Symbols

- `[CacheMixin.Config]()`: Called to restore state from storage. Usually placed in `connectedCallback`.
- `[CacheMixin.Clear]()`: Manually removes the cache entry for this instance.
- `[CacheMixin.OnError](callback)`: Registers a function to receive error events.

## Best Practices

1. **Call `Config()` in `connectedCallback`**: This is the recommended point to restore state after the component is inserted into the DOM.
2. **Use `cacheId` for Record Context**: If your component lives on a record page, pass the `recordId` to `cacheId` to ensure users see the correct cached data for each record.
3. **Keep it Light**: Only cache essential UI state or draft data. For large datasets, consider using a proper data service.
