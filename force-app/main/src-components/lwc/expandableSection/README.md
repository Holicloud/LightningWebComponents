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
<c-expandable-section title="Your title">content</c-expandable-section>
```

### Collapsed by Default

```html
<c-expandable-section title="Your title" is-collapsed>
  content
</c-expandable-section>
```

### Non-Collapsible Section

```html
<c-expandable-section title="Your title" non-collapsible>
  content
</c-expandable-section>
```
