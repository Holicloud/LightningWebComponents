#### File: `alertBasic.html`

```html
<template>
  <div class="slds-m-around_medium">
    <c-alert>variant info</c-alert>
  </div>
  <div class="slds-m-around_medium">
    <c-alert variant="warning">variant warning</c-alert>
  </div>
  <div class="slds-m-around_medium">
    <c-alert variant="error">variant error</c-alert>
  </div>
  <div class="slds-m-around_medium">
    <c-alert variant="offline">variant offline</c-alert>
  </div>
  <div class="slds-m-around_medium">
    <c-alert action-message="More Information" onaction={handleAction}>with action</c-alert>
  </div>
  <div class="slds-m-around_medium">
    <c-alert non-collapsible>non collapsible</c-alert>
  </div>
  <div class="slds-m-around_medium">
    <c-alert icon-name="utility:activity">overwrite icon</c-alert>
  </div>
</template>

```

#### File: `alert.js`

```javascript
import { LightningElement } from 'lwc';

export default class AlertBasic extends LightningElement {
  handleAction() {
    console.log('do something such as naviagte somewhere');
    // navigate to somewhere
  }
}
```

You can find these files in the repository at:  
[alert](https://github.com/santiagoparradev/LWC-RECIPES-SANTIAGO/tree/main/src-components-examples/main/default/lwc/alert)
```