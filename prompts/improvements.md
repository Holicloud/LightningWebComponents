# Improvements & Ideas

## Bug Fixes & Quick Wins

### 1. Typo: `highlightTittleOnMatch` → `highlightTitleOnMatch`

**Files:** `lookup.js`, `apexLookup.js`  
Both components have `highlightTittleOnMatch` (double `t`). This is a public API so renaming it is a breaking change — consider adding an alias or deprecation path.

### 2. Typo: `CsvProccessor` → `CsvProcessor`

**File:** `csv.js`, `utils.js`  
The class name has an extra `c`. Same API consideration applies.

### 3. Typo: `setHeaderTranformations` → `setHeaderTransformations`

**File:** `csv.js`  
Missing an `s` in "Transformations".

### 4. Missing `__mocks__` files

Many components in `src-components` don't have `__mocks__` directories despite the code guidelines requiring them. Components that need mocks:

- `alert`, `expandableSection`, `summaryDetail`, `scopedNotification`, `errorsAccordion`, `panel`, `formattedMarkdown`, `illustration`, `entry`, `record`, `lookup`, `datatablePlus`

### 5. `alert.js` — `hideAlert` should be `handleHideAlert`

Per the naming convention, all event handler methods should start with `handle`.

---

## Architecture Improvements

### 6. Unify Validation API

`lookup` and `panel` both implement a validation contract (`checkValidity`, `reportValidity`, `setCustomValidity`). Extract a **Validation Mixin** to standardize:

```js
const ValidationMixin = (Base) => class extends Base {
  @api checkValidity() { ... }
  @api reportValidity() { ... }
  @api setCustomValidity(message) { ... }
  @api showHelpMessageIfInvalid() { ... }
};
```

### 7. Extract Constants to a Shared LABELS Module

Many components define inline `LABELS` objects. Consider a shared labels module for:

- Consistency in messaging across components
- Easier i18n support via Custom Labels in the future

### 8. Centralize Variant Pattern

Create a `VariantMixin` or helper that standardizes how variants are handled:

```js
const withVariants = (variants, defaultVariant) => (Base) =>
  class extends Base {
    @api variant = defaultVariant;
    get variantProps() {
      return variants[this.variant] || variants[defaultVariant];
    }
  };
```

### 9. Consider Using `refs` Over `querySelector`

LWC `refs` (via `lwc:ref`) is the modern approach. The `lookup` component still uses `this.template.querySelector('[data-id="remove"]')` in some places while also using `this.refs.input` in others. Standardize on `refs` where possible.

---

## Testing Improvements

### 10. Add TypeScript JSDoc Annotations

Add JSDoc type annotations to all public APIs for better IDE support and documentation:

```js
/**
 * @api
 * @type {string}
 * @default "info"
 */
@api variant = "info";
```

### 11. Add Integration Tests

Currently all tests are unit tests. Consider adding integration tests for composite components like `wizard` + `wizardStep` together.

### 12. Test Coverage for `booleanExpressionEngine`

This is a pure-logic component — excellent candidate for extensive edge-case testing (nested parentheses, boundary conditions, error paths).

### 13. Add Snapshot Testing

For template-heavy components like `illustration` (20 variants), snapshot tests would catch unintentional SVG template changes.

---

## Developer Experience

### 14. Component Generator Script

Create a CLI script/template to scaffold new components:

```bash
node scripts/create-component.js myNewComponent --source=src-components
# Creates: folder, .js, .html, .css, .js-meta.xml, README.md, __tests__/, __mocks__/
```

### 15. Storybook or Component Playground

Build a dedicated in-org app or static site to preview all components with different props/variants. The existing `force-app-examples` serve this purpose partially, but a more interactive playground would help.

### 16. Auto-Generated API Documentation

Use the JSDoc comments + component metadata to auto-generate an API reference site, similar to the Salesforce Component Reference.

### 17. Pre-commit Performance

The current `lint-staged` runs `eslint . --fix` on the entire repo for every commit (the glob is `**/*`). Consider narrowing the glob to only staged files:

```json
"**/*.js": ["eslint --fix"]  // only staged JS files
```

---

## Code Quality

### 18. Replace `event.keyCode` with `event.key`

`lookup.js` uses deprecated `event.keyCode`. Modernize to `event.key`:

```js
// Before
case KEY_INPUTS.ESCAPE: // 27

// After
case "Escape":
```

### 19. Add Error Boundaries

Components like `formattedMarkdown` make fetch calls but could benefit from `errorCallback()` lifecycle for graceful failure rendering.

### 20. CSP-Compliant Markdown Rendering

`formattedMarkdown` uses `innerHTML` which is flagged by ESLint. Consider a CSP-safe alternative like building DOM nodes programmatically from the parsed AST.

### 21. consider removing unused `DatatablePlusExtendedTypes` LWC class

The `DatatablePlusExtendedTypes` extends `LightningElement` but only has a single method `getDataTypes()` that returns a constant. The actual types are used via the exported `TYPES` constant — the class itself may be unnecessary.

---

## Future Feature Ideas

### 22. Toast Mixin

Similar to `MessageChannelMixin`, create a `ToastMixin` for standardized toast notifications:

```js
this[ShowToast]({
  title: "Success",
  message: "Record saved",
  variant: "success"
});
```

### 23. Virtual Scrolling for Lookup

For large datasets, the lookup dropdown could benefit from virtual scrolling instead of loading all results.

### 24. Datatable Export

Add CSV/XLSX export functionality to `datatablePlus` using the existing `CsvProcessor` pattern.

### 25. Form Validation Framework

Build on the `panel` validation pattern to create a full form validation framework with custom validators, async validation, and field-level error display.

### 26. Dark Mode Support

Add dark mode CSS variables/themes to complement the SLDS foundation.
