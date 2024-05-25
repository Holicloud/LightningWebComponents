The `ExpandableSection` is a reusable Lightning Web Component (LWC) that provides a collapsible section based on the [Salesforce Lightning Design System (SLDS)](https://www.lightningdesignsystem.com/components/expandable-section/).

## 🛠️ **Attributes**

### Public Properties

- **📌 `title`** (String, Required):  
  The title displayed for the section.

- **📌 `isCollapsed`** (Boolean, Optional):  
  Indicates whether the section is initially collapsed.

  - `true`: Collapsed (hidden content).
  - `false`: Expanded (visible content).  
    Default: `false`.

- **📌 `nonCollapsible`** (Boolean, Optional):  
  Makes the section non-collapsible. When set to `true`, the section cannot be toggled.  
  Default: `false`.

## 🎯 **Slots**

- **Default Slot**:  
  Place any content to be displayed inside the section.

## 💡 **Usage**

### Example

```html
<template>
  <!-- Default Expandable Section -->
  <c-expandable-section title="Default Section"> Content goes here. </c-expandable-section>

  <!-- Collapsed by Default Section -->
  <c-expandable-section title="Collapsed Section" is-collapsed>
    This section is initially collapsed.
  </c-expandable-section>

  <!-- Non-Collapsible Section -->
  <c-expandable-section title="Non-Collapsible Section" non-collapsible>
    This section cannot be collapsed.
  </c-expandable-section>
</template>
```

## 🎨 **Styling**

For more details on the design and structure, visit the official [SLDS Expandable Section Documentation](https://www.lightningdesignsystem.com/components/expandable-section/).
