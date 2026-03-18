# Code Patterns & Architecture

## Repository Architecture

```
LightningWebComponents/
├── force-app/main/
│   ├── src-components/lwc/       # Pure LWC components (no Apex dependency)
│   ├── src-components-with-apex/ # Components requiring Apex controllers
│   ├── src-utils/lwc/            # Shared utility modules
│   ├── default/                  # Salesforce org metadata (classes, objects, etc.)
│   └── form-builder/             # Form builder module (under review)
├── force-app-examples/           # Usage examples (excluded from CI tests)
├── force-app/test/jest/          # Shared test utilities
├── test/setupFiles/              # Jest setup (a11y, env vars)
├── scripts/                      # Apex & SOQL scripts
├── prompts/                      # AI/agent knowledge base
└── config/                       # Scratch org definition
```

### Package Directories (`sfdx-project.json`)

- `force-app` (default) — main library source
- `force-app-examples` — example implementations

## Design Patterns

### 1. Variant Pattern

Used extensively for components with multiple visual modes. Variants are defined as frozen objects mapping variant names to their configuration:

```js
export const VARIANTS = Object.freeze({
  error: { alertClass: "slds-alert_error", iconName: "utility:error" },
  info:  { alertClass: "slds-alert_info",  iconName: "utility:info" }
});

get variantProps() {
  return VARIANTS[this.variant] || VARIANTS[DEFAULT_VARIANT];
}
```

**Used in:** `alert`, `scopedNotification`, `illustration`, `wizard`, `lookup`

### 2. Mixin Pattern (via `Mixer` class)

The `Mixer` class enables composable mixins on `LightningElement`:

```js
import { Mixer } from "c/utils";
import { MessageChannelMixin } from "c/messageChannelMixin";

export default class MyComponent extends new Mixer().mix(MessageChannelMixin) {
  // Has Subscribe, Publish, Unsubscribe via Symbols
}
```

**Key:** Mixins use `Symbol` keys to avoid naming collisions.

### 3. Composition Pattern (Slot-based)

Parent components manage child components through event registration:

```js
// wizard.js
handleRegister(event) {
  const step = event.detail;
  this.steps[step.name] = step;
}
// wizardStep dispatches "register" with its name and method references
```

### 4. Wrapper/Delegation Pattern

`apexLookup` wraps `lookup` to add Apex data fetching while delegating all API methods:

```js
@api checkValidity() { return this.refs.lookup.checkValidity(); }
@api reportValidity() { return this.refs.lookup.reportValidity(); }
```

### 5. Builder Pattern

`CsvProcessor` uses method chaining:

```js
const result = await new CsvProccessor(file)
  .setSeparator(",")
  .setMaxSize(2000000)
  .setHeaderTranformations({ "Old Name": "newName" })
  .doForEachRecord((record) => validate(record))
  .getRecords();
```

### 6. Dynamic Template Rendering

`illustration` uses the LWC `render()` lifecycle to select different HTML templates:

```js
render() {
  return TEMPLATE_BY_VARIANT[this.variant];
}
```

### 7. Dynamic Component Loading

`datatablePlusExtendedTypes` uses dynamic imports for loading cell renderers:

```js
async function renderComponent(type, components, defaultType) {
  if (typeof type === "function") {
    const { default: ctor } = await type();
    return ctor;
  }
}
```

### 8. Private Fields for Encapsulation

Utility classes (e.g., `CsvProcessor`) use JS private class fields (`#`):

```js
class CsvProccessor {
  #file;
  #separator = DEFAULT_SEPARATOR;
  #maxSize = MAX_FILE_SIZE_IN_BYTES;
}
```

### 9. Map-based State Management

The `lookup` component uses a `Map` to manage record state, avoiding array mutations:

```js
records = new Map();

upsertRecord(id, updates) {
  const existing = this.records.get(id) || {};
  this.records.set(id, { ...existing, ...updates });
}
```

### 10. Throttled Search Pattern

`lookup` implements search throttling to avoid excessive API calls:

```js
if (this.searchThrottlingTimeout) {
  clearTimeout(this.searchThrottlingTimeout);
}
this.searchThrottlingTimeout = setTimeout(async () => {
  // perform search
}, INPUT_SEARCH_DELAY);
```

## Utility Library (`c/utils`)

The `utils` module is a barrel that re-exports from specialized files:

| Module                 | Exports                                                      | Purpose                               |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------- |
| `utils.js`             | `clone`, `assert`, `Mixer`                                   | Deep clone, assertions, mixin support |
| `strings.js`           | `isBlank`, `isNotBlank`, `isValidDate`, `convertToISOString` | String/date validation                |
| `objects.js`           | `isObject`, `deepMerge`, `flattenObject`                     | Object manipulation                   |
| `classSet.js`          | `classSet`                                                   | Dynamic CSS class builder             |
| `classListMutation.js` | `classListMutation`                                          | Host element class toggling           |
| `csv.js`               | `CsvProccessor`                                              | CSV file parsing with builder pattern |
| `ldsUtils.js`          | `reduceErrors`                                               | LDS/Apex error normalization          |

## Non-UI Components

| Component                    | Type            | Purpose                                                   |
| ---------------------------- | --------------- | --------------------------------------------------------- |
| `booleanExpressionEngine`    | Logic engine    | Shunting-yard algorithm for boolean expression evaluation |
| `messageChannelMixin`        | Mixin           | LMS (Lightning Message Service) subscription management   |
| `datatablePlusExtendedTypes` | Type definition | Custom column types for DatatablePlus                     |
