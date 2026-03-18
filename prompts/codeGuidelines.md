# LWC Code Guidelines

## Naming Conventions

| Element                    | Convention                                  | Example                           |
| -------------------------- | ------------------------------------------- | --------------------------------- |
| Constants                  | `UPPER_SNAKE_CASE`                          | `const INPUT_SEARCH_DELAY = 300;` |
| `data-id` attributes       | `kebab-case`                                | `data-id="close-button"`          |
| Event handlers             | Prefix with `handle`                        | `handleInput()`, `handleBlur()`   |
| Private backing properties | Prefix with `_`                             | `_isHidden`, `_variant`           |
| Private class fields       | Use `#` for true encapsulation (utils only) | `#file`, `#separator`             |
| Boolean properties         | Prefix with `is`, `has`, `show`, `display`  | `isHidden`, `hasRender`           |

## Constants & Frozen Objects

- Constants that are arrays or objects **must** use `Object.freeze(value)`.
- Avoid hardcoding values; extract them to named constants at the top of the file.
- Export constants separately when they need to be tested or reused:

```js
export const VARIANTS = Object.freeze({
  error: { alertClass: "slds-alert_error", iconName: "utility:error" },
  info: { alertClass: "slds-alert_info", iconName: "utility:info" }
});
```

## Properties & Variables

- Do **not** define multiple properties on a single line.
- Variables used only once should be inlined — remove single-use variables.
- All query selectors must use `data-id`, never dynamic class selectors.
- `@api` properties with getters/setters must have a corresponding private property prefixed with `_`:

```js
@api
get isCollapsed() { return this._isCollapsed; }
set isCollapsed(value) { this._isCollapsed = value; }

_isCollapsed = false;
```

## File Structure (Enforced by `validate-lwc.js`)

### Top-Level Order

1. **Imports** — alphabetically sorted by module path
2. **Constants** (`const`)
3. **Properties** (non-const variables)
4. **Helper functions** — arrow functions first, then `function` declarations
5. **Class** (`export default class ...`)
6. **Named exports** at the bottom

### Class Body Order

1. `@api` properties (alphabetically)
2. `@api` getter/setter pairs (grouped, alphabetically)
3. `@api` methods (alphabetically)
4. `@track` properties (alphabetically)
5. Private properties (alphabetically)
6. `@wire` properties (alphabetically)
7. `@wire` methods (alphabetically)
8. Private getters/setters (grouped, alphabetically)
9. Private methods — arrow properties first, then normal methods (alphabetically within each group)
10. Lifecycle hooks (alphabetically: `connectedCallback`, `disconnectedCallback`, `renderedCallback`, etc.)

> [!IMPORTANT]
> This ordering is enforced by `validate-lwc.js` on every commit and CI run. Use `node fix-lwc.js .` to auto-fix.

## Event Handling

- All event handler method names **must** start with `handle`:

```js
handleInput(event) { ... }
handleBlur() { ... }
```

- Use `CustomEvent` for component events with `detail` payloads:

```js
this.dispatchEvent(
  new CustomEvent("change", {
    detail: { value: this.value, info: this.selectedRecords }
  })
);
```

## CSS Class Generation

- Use the `classSet` utility from `c/utils` for dynamic CSS classes:

```js
get alertClasses() {
  return classSet("slds-notify slds-notify_alert")
    .add({ [this.variantProps.alertClass]: !!this.variantProps.alertClass })
    .toString();
}
```

- Use `classListMutation` for host-level class toggling:

```js
classListMutation(this.classList, {
  "slds-form-element_stacked": this.variant === VARIANTS.LABEL_STACKED
});
```

## Component Mocks

- Every component **should** have a corresponding `__mocks__` file when applicable.
- Mock files must include all `@api` props and methods.

## Testing Requirements

- All Jest tests must create components using `ElementBuilder`.
- All tests must verify accessibility: `expect(element).toBeAccessible();`
- Event listeners must be tested using `createMockedEventListener`:

```js
const actionMock = createMockedEventListener(element, "action");
getAction().click();
expect(actionMock).toHaveBeenCalled();
```

- For `disconnectedCallback` testing, use `removeChildren()`.
- Prefer a single `describe` block per test file; add additional `describe` blocks in separate test files if needed.

## Lifecycle Patterns

- Use `hasRender` flag to run one-time setup in `renderedCallback`:

```js
renderedCallback() {
  if (!this.hasRender) {
    this.hasRender = true;
    // one-time initialization
  }
}
```

## Error Handling

- Use `assert()` from `c/utils` for precondition checks:

```js
assert(isNotBlank(this.apexClass), "Apex Class is a required Parameter");
```

- Use `reduceErrors()` from `c/ldsUtils` for LDS/Apex error normalization.

## Import Style

- Group imports: Salesforce platform → custom components (`c/`) → LWC framework
- Keep imports alphabetically sorted within groups
