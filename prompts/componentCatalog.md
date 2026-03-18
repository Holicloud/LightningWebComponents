# Component Catalog

## UI Components (`src-components/lwc/`)

### alert

Dismissible SLDS alert banner with variant support (error, info, offline, warning).

- **API:** `variant`, `isHidden`, `actionMessage`, `iconName`, `isNonCollapsible`
- **Events:** `action`, `collapsed`
- **Patterns:** Variant pattern, classSet for CSS

### datatablePlus

Extended `lightning-datatable` with custom column types and automatic record flattening.

- **API:** `records` (getter/setter that flattens nested objects)
- **Extends:** `LightningDatatable`
- **Related:** `datatablePlusDynamicCell`, `datatablePlusDynamicCellEdit`, `datatablePlusExtendedTypes`

### entry

Displays formatted values with optional label mapping from an options object.

- **API:** `value` (single or array), `options`, `separator`
- **Pattern:** Pure display component, no events

### errorsAccordion

Collapsible accordion for displaying grouped validation errors.

- **API:** `errors` (object of arrays), `isHidden`, `isNonDismissable`, `title`
- **Events:** `dismiss`
- **Features:** Expand all / Collapse all functionality

### expandableSection

Collapsible SLDS section with toggle.

- **API:** `title`, `isCollapsed`, `isNonCollapsible`
- **Pattern:** Private property backing with `_isCollapsed`

### formattedMarkdown

Renders Markdown content from string or URL using external `marked` library.

- **API:** `string`, `url`
- **Pattern:** Uses `loadScript`/`loadStyle` for static resources, `lwc:dom="manual"`

### illustration

SLDS illustration SVGs with 20 variant templates and customizable colors.

- **API:** `variant`, `size`, `title`, `hideIllustration`, colors/strokes
- **Pattern:** Dynamic `render()` method returns variant-specific HTML templates
- **Variants:** desert, going-camping, open-road, no-access, maintenance, etc.

### lookup

Full-featured search/select component with keyboard navigation, throttled search, and multi/single entry modes.

- **API:** `searchHandler`, `selectionHandler`, `value`, `label`, `variant`, `isMultiEntry`, `required`, `disabled`, `validity`, etc.
- **Events:** `change`, `focus`, `blur`, `action`, `invalid`
- **Methods:** `focus()`, `blur()`, `checkValidity()`, `reportValidity()`, `setCustomValidity()`, `showHelpMessageIfInvalid()`
- **Patterns:** Map-based state, throttled search, keyboard navigation, validation API

### lookupSubtitle

Sub-component for rendering lookup result subtitles with dynamic components.

- **Pattern:** Dynamic import for custom subtitle renderers

### messageChannelMixin

Mixin for Lightning Message Service (LMS) pub/sub.

- **Exports:** `MessageChannelMixin` function, `Subscribe`, `Publish`, `Unsubscribe`, `Subscriptions`, `Context` Symbols
- **Usage:** `new Mixer().mix(MessageChannelMixin)`
- **Auto-cleanup:** Unsubscribes in `disconnectedCallback`

### panel

Card-style container with built-in form validation support.

- **API:** `title`, `icon`, `classes`
- **Methods:** `checkValidity()`, `reportValidity()`, `setCustomValidity(message, field)`
- **Pattern:** Queries all `[data-input]` children for validation

### record

Displays record field values using `getRecords` wire adapter.

- **API:** `value` (record ID or array), `displayField`, `separator`
- **Pattern:** Wire adapter, reactive payload

### scopedNotification

SLDS scoped notification with variants (info, success, warning, error).

- **API:** `variant`, `isHidden`, `actionMessage`, `iconName`
- **Events:** `action`

### summaryDetail

SLDS summary-detail collapsible section.

- **API:** `title`, `isCollapsed`, `isNonCollapsible`

### wizard / wizardStep

Multi-step wizard with progress indicator and step validation.

- **Wizard API:** `currentStep`, `header`, `variant`, labels (`nextLabel`, `previousLabel`, `finishLabel`)
- **Wizard Events:** `change`, `complete`
- **Pattern:** Slot-based composition, step registration via events

## Logic-Only Components

### booleanExpressionEngine

Boolean expression evaluator using shunting-yard algorithm (RPN).

- **Exports:** `validateExpression(expression, maxIndex)`, `evaluateExpression(values, expression)`
- **Supports:** `AND`, `OR`, `NOT`, parentheses, numbered conditions

## Apex-Dependent Components (`src-components-with-apex/lwc/`)

### apexLookup

Apex-powered wrapper around `lookup` component with cacheable/non-cacheable Apex calls.

- **API:** All of `lookup` props + `apexClass`, `payload`, `isNonCacheable`
- **Apex Controller:** `LookupController` (getDefault, getMatching, getSelection + non-cacheable variants)
- **Pattern:** Delegation pattern, event forwarding

## Utility Modules (`src-utils/lwc/`)

### utils (barrel module)

Re-exports: `clone`, `assert`, `Mixer`, `isBlank`, `isNotBlank`, `isValidDate`, `convertToISOString`, `isObject`, `deepMerge`, `flattenObject`, `classSet`, `CsvProccessor`, `classListMutation`

### ldsUtils

Exports: `reduceErrors` — normalizes all LDS/Apex error formats into `string[]`
