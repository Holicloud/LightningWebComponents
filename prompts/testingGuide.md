# Testing Guide

## Test Framework Overview

| Tool                        | Purpose                              |
| --------------------------- | ------------------------------------ |
| `@salesforce/sfdx-lwc-jest` | LWC Jest adapter                     |
| `@sa11y/jest`               | Accessibility testing (a11y)         |
| `jest-canvas-mock`          | Canvas API mock for SLDS             |
| Custom `ElementBuilder`     | Standardized component instantiation |
| Custom `test/utils`         | Shared test helpers                  |

## Configuration (`jest.config.js`)

- **Timeout:** 120 seconds (overridable via `JEST_TIMEOUT` env var)
- **Coverage threshold:** 75% (statements + lines) for all source directories
- **Coverage collected from:** `src-components`, `src-components-with-apex`, `src-utils`, `default/lwc`, `form-builder`
- **Excluded from tests:** `force-app-examples/`
- **Module aliases:**
  - `test/utils` → `force-app/test/jest/utils`
  - `lightning/navigation`, `lightning/modal`, `lightning/platformShowToastEvent` → custom mocks

## ElementBuilder Pattern

All tests **must** use `ElementBuilder` for component creation:

```js
import Alert, { VARIANTS } from "c/alert";
import { ElementBuilder, removeChildren, getByDataId } from "test/utils";

const elementBuilder = new ElementBuilder("c-alert", Alert);

describe("c-alert", () => {
  let element;

  afterEach(() => {
    removeChildren();
  });

  it("renders correctly", async () => {
    element = await elementBuilder.build({ variant: "error" });
    expect(element).toBeAccessible();
  });
});
```

### ElementBuilder API

```js
// Constructor
new ElementBuilder(descriptor, componentReference, config?)

// Config options (defaults)
{
  defaultApiProps: {},      // Default @api property values
  appendChild: true,        // Auto-append to DOM
  mergeProperties: true,    // Deep-merge overwrite props with defaults
  flushAfter: true,         // Auto-flush promises after creation
  parentNode: document.body // Target parent node
}

// Methods
elementBuilder.setConfig({ defaultApiProps: { label: "Test" } })  // Returns new instance
await elementBuilder.build({ variant: "error" })                  // Build with overrides
```

## Test Utilities (`test/utils`)

| Function                    | Signature                     | Purpose                                        |
| --------------------------- | ----------------------------- | ---------------------------------------------- |
| `getByDataId`               | `(element, dataId)`           | Query single element by `data-id`              |
| `getAllByDataId`            | `(element, dataId)`           | Query all elements by `data-id`                |
| `flushPromises`             | `()`                          | Flush all pending promises                     |
| `removeChildren`            | `(root?)`                     | Remove all children (default: `document.body`) |
| `createMockedEventListener` | `(element, eventName, impl?)` | Create & attach spy listener                   |
| `suppressLwcDomWarnings`    | `()`                          | Suppress `lwc:dom="manual"` warnings           |
| `restoreLwcDomWarnings`     | `()`                          | Restore console.warn                           |

## Test Structure Rules

1. **Single describe per file** — add more describe blocks as separate test files
2. **Always use `afterEach`** with `removeChildren()` for cleanup
3. **Always test accessibility** with `expect(element).toBeAccessible()`
4. **Event testing** pattern:

```js
const eventMock = createMockedEventListener(element, "change");
// trigger action
expect(eventMock).toHaveBeenCalledWith(
  expect.objectContaining({
    detail: { value: "expected" }
  })
);
```

5. **Disconnected callback testing** — use `removeChildren()`:

```js
it("cleans up on disconnect", async () => {
  element = await elementBuilder.build();
  removeChildren();
  // assert cleanup behavior
});
```

6. Query helpers pattern per test file:

```js
const getAlert = () => getByDataId(element, "alert"),
  getAction = () => getByDataId(element, "action"),
  getCloseButton = () => getByDataId(element, "close-button");
```

## Running Tests

```bash
# Run all unit tests
npm test

# Run with watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage

# Debug mode
npm run test:unit:debug

# Run a specific test file
npx sfdx-lwc-jest -- --testPathPattern="alert"
```

## Lightning Mocks (`force-app/test/jest/jest-mocks/`)

Custom mocks provided for:

- `lightning/navigation`
- `lightning/modal`
- `lightning/platformShowToastEvent`

## Accessibility Testing

Setup in `test/setupFiles/jest-sa11y-setup.js`:

- Uses `@sa11y/jest` for `toBeAccessible()` matcher
- Every component test should include at least one accessibility assertion
