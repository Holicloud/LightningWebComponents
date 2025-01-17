## File: `expandableSectionBasic.html`

```html
<template>
  <c-expandable-section title="Default"> content </c-expandable-section>
  <c-expandable-section title="Is Collapsed" is-collapsed>
    content
  </c-expandable-section>
  <c-expandable-section title="Non Collapsible" non-collapsible>
    content
  </c-expandable-section>
</template>
```

## File: `expandableSectionBasic.js`

```javascript
import { LightningElement } from "lwc";

export default class ExpandableSectionBasic extends LightningElement {}
```

## Repository Location

You can find these files in the repository at:  
[Expandable Section Basic](https://github.com/santiagoparradev/LWC-RECIPES-SANTIAGO/tree/main/src-components-examples/main/default/lwc/expandableSectionBasic)
