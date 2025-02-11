# CacheMixin

A robust, reusable Lightning Web Component mixin for standardizing client-side state persistence. It supports both `sessionStorage` and `localStorage` backends and handles lifecycle-based data restoration and cleanup.

## Features

- **Configurable Storage**: Choose between `session` (default) or `local` storage.
- **Symbol-based API**: Ensures no property collisions with your component's internal logic.
- **Duplicate Key Protection**: Prevents multiple active instances of the same component (with the same `cacheId`) from overwriting each other's cache.
- **Expiration Support**: Automatically expires cache entries after a configurable time (default 60 minutes).
- **On/Off Toggle**: Use `[CacheMixin.Enable]()` and `[CacheMixin.Disable]()` to dynamically manage caching state.
- **Set Unique ID**: Use `[CacheMixin.SetUniqueIdentifier](id)` to differentiate cache keys for multiple instances.
- **Global Cleanup**: Use `[CacheMixin.ClearAll]()` to wipe all cache for a component type across all unique identifiers.
- **Quota Management**: Automatically purges oldest entries (LRU) when browser storage is full.
- **Detailed Telemetry**: Register a callback via `[CacheMixin.OnEvent]` to receive `cachehit`, `cachemiss`, `cacheexpire`, and `cacheerror` notifications.
- **Strict Encapsulation**: Internal state and methods are protected using private fields and non-exported Symbols.

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
    // Optional: Register telemetry listener
    this[CacheMixin.OnEvent]((type, detail) => {
      console.log(`Cache event [${type}] for key: ${detail.key}`);
    });

    // Optional: Set unique ID (e.g. recordId)
    this[CacheMixin.SetUniqueIdentifier](this.recordId);

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
  // ... properties and logic ...
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

### Symbols (Public API)

- `[CacheMixin.Config]()`: Restores the cached state into the component properties. Usually called in `connectedCallback`.
- `[CacheMixin.SetUniqueIdentifier](value)`: Sets a unique identifier (like a record ID) to avoid key collisions between instances.
- `[CacheMixin.Clear]()`: Manually removes the cache entry for the current instance.
- `[CacheMixin.ClearAll]()`: Wipes all cache keys associated with this `componentName` across all unique identifiers.
- `[CacheMixin.Enable]()`: Enables the caching logic (default state).
- `[CacheMixin.Disable]()`: Disables the caching logic.
- `[CacheMixin.OnEvent](callback)`: Registers a telemetry listener `(type, detail) => void`.
- `[CacheMixin.OnError](callback)`: Registers an error handler `(error) => void`.

### Telemetry Types

The callback registered via `[CacheMixin.OnEvent]` receives the following event types:

| Type          | Detail Properties               | Description                                  |
| ------------- | ------------------------------- | -------------------------------------------- |
| `cachehit`    | `componentName`, `key`          | Data found and successfully restored.        |
| `cachemiss`   | `componentName`, `key`          | No cache entry found for the current key.    |
| `cacheexpire` | `componentName`, `key`          | Entry found but has exceeded its expiration. |
| `cacheerror`  | `componentName`, `key`, `error` | Error during JSON parsing or storage access. |

## Best Practices

1. **Unique Identifiers**: Always use `[CacheMixin.SetUniqueIdentifier]` if your component is used in a list or for different records to prevent data cross-talk.
2. **State Restoration**: Call `[CacheMixin.Config]()` early in the lifecycle to minimize UI flickering as state is populated.
3. **Telemetry**: Use `[CacheMixin.OnEvent]` to integrate with your application's logging or monitoring infrastructure.
