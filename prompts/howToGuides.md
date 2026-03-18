# How-To Guides

## Adding a New Component to the Library

### 1. Create the component folder

Components go in `force-app/main/src-components/lwc/` (or `src-components-with-apex/` if Apex is required):

```
force-app/main/src-components/lwc/
└── myComponent/
    ├── myComponent.js
    ├── myComponent.html
    ├── myComponent.css        (optional)
    ├── myComponent.js-meta.xml
    ├── README.md
    └── __tests__/
        └── myComponent.test.js
```

### 2. Write the JS file following the structure rules

```js
import { classSet } from "c/utils"; // 1. Imports (alphabetical)
import { LightningElement, api } from "lwc";

const DEFAULT_VARIANT = "info"; // 2. Constants

export default class MyComponent extends LightningElement {
  // 3. @api properties (alphabetical)
  @api disabled = false;
  @api title = "";

  // 4. @api getters/setters (alphabetical, grouped)
  @api
  get variant() {
    return this._variant;
  }
  set variant(value) {
    this._variant = value || DEFAULT_VARIANT;
  }

  // 5. Private properties (alphabetical)
  _variant = DEFAULT_VARIANT;

  // 6. Private getters
  get computedClass() {
    return classSet("slds-box")
      .add({ "slds-theme_shade": this.variant === "shade" })
      .toString();
  }

  // 7. Private methods (arrow first, then normal, alphabetical)
  handleClick() {
    this.dispatchEvent(new CustomEvent("action", { detail: this.title }));
  }

  // 8. Lifecycle hooks
  connectedCallback() {}
}
```

### 3. Create the XML metadata

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>63.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>My Component</masterLabel>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
    </targets>
</LightningComponentBundle>
```

### 4. Write tests using ElementBuilder

```js
import MyComponent from "c/myComponent";
import {
  ElementBuilder,
  removeChildren,
  getByDataId,
  createMockedEventListener
} from "test/utils";

const elementBuilder = new ElementBuilder("c-my-component", MyComponent);

describe("c-my-component", () => {
  afterEach(() => removeChildren());

  it("renders with defaults", async () => {
    const element = await elementBuilder.build();
    expect(element).toBeAccessible();
  });

  it("fires action event on click", async () => {
    const element = await elementBuilder.build({ title: "Test" });
    const actionMock = createMockedEventListener(element, "action");
    getByDataId(element, "action-button").click();
    expect(actionMock).toHaveBeenCalledWith(
      expect.objectContaining({ detail: "Test" })
    );
  });
});
```

### 5. Create README.md

Write a README documenting the component's purpose, API, events, and usage examples.

### 6. Validate and commit

```bash
# Validate structure
node validate-lwc.js force-app/main/src-components/lwc/myComponent/

# Auto-fix ordering issues
node fix-lwc.js force-app/main/src-components/lwc/myComponent/

# Run tests
npx sfdx-lwc-jest -- --testPathPattern="myComponent"

# Run lint
npm run lint

# Run prettier
npm run prettier
```

---

## Running Validations

### Local Validation (Full Suite)

```bash
# 1. Prettier formatting check
npm run prettier:verify

# 2. LWC structure validation (custom ordering rules)
node validate-lwc.js .

# 3. ESLint
npm run lint:verify

# 4. Unit tests with coverage
npm run test:unit:coverage
```

### Auto-fix Commands

```bash
# Fix formatting
npm run prettier

# Fix lint issues
npm run lint

# Fix LWC ordering
node fix-lwc.js .
```

### Pre-commit (Automatic via Husky)

The pre-commit hook runs `lint-staged`, which automatically:

1. Runs `prettier --write` on all supported file types
2. Runs `eslint . --fix` on all files
3. Runs `node validate-lwc.js` on all LWC JS files

### Salesforce Code Analyzer

```bash
# Run the SF Code Analyzer
npm run analyzer
# or directly:
sf code-analyzer run
```

### CI Pipeline Validation (what runs on PR)

The `ci-pr.yml` workflow runs these steps:

1. `npm run prettier:verify`
2. `node validate-lwc.js .`
3. `npm run lint:verify`
4. `npm run test:unit:coverage`
5. Salesforce Code Analyzer (max 10 violations threshold)
6. Create scratch org → deploy → run Apex tests
7. Upload coverage to Codecov

---

## Working with the Scratch Org

```bash
# Create scratch org
sf org create scratch -f config/project-scratch-def.json -a scratch-org -d -y 7

# Deploy source
sf project deploy start

# Run Apex tests
sf apex test run -c -r human -d ./tests/apex -w 20

# Delete scratch org
sf org delete scratch -p -o scratch-org
```

---

## Deploying to Production

Push to `main` branch triggers the `ci.yml` workflow which:

1. Authenticates via `DEVHUB_SFDX_URL` secret
2. Runs `sf project deploy start --test-level RunAllTestsInOrg --target-org devhub`

---

## Adding a New Utility Function

Add to the appropriate file in `force-app/main/src-utils/lwc/utils/`:

- String functions → `strings.js`
- Object functions → `objects.js`
- New category → create new file + add re-export in `utils.js`

```js
// In utils.js, add the re-export:
export { myNewFunction } from "./myModule";
```

---

## Creating Mixins

Use the `Mixer` pattern in `c/utils`:

```js
const MyMixin = (Base) => {
  return class extends Base {
    // Add mixed-in functionality
    myMethod() { ... }

    disconnectedCallback() {
      // Cleanup
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }
  };
};

// Usage:
export default class MyComp extends new Mixer().mix(MyMixin, OtherMixin) { }
```
