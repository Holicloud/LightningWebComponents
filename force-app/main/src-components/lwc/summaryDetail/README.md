# Specification

## Properties

| **Property**       | **Type**         | **Description**                                                                                              |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `@api title`       | `String`         | The title displayed in the header of the section.                                                           |
| `@api isCollapsed` | `Boolean`        | Controls the collapsed state of the section. Defaults to `false`. If `true`, the section is collapsed.       |
| `@api isNonCollapsible` | `Boolean`        | If `true`, the section is always expanded and cannot be collapsed. Defaults to `false`.                     |

## Example Usage

### Default (Expanded by Default)

```html
<c-summary-detail title="Your title">content</c-summary-detail>
```

### Default with custom title

```html
<c-summary-detail>
    <div slot="title">
        config title
    </div>
    content
</c-summary-detail>
```

### Collapsed

```html
<c-summary-detail title="Your title" is-collapsed>
  content
</c-summary-detail>
```

### Non-Collapsible

```html
<c-summary-detail title="Your title" is-non-collapsible>
  content
</c-summary-detail>
```
