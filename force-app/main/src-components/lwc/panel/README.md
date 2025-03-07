# Documentation

| **Property/Method**                           | **Type**   | **Description**                                                                                                                                                      |
| --------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@api icon`                                   | `String`   | The name of the Lightning icon displayed in the header. Defaults to `"utility:user"`.                                                                                |
| `@api title`                                  | `String`   | The title displayed in the card header.                                                                                                                              |
| `@api classes`                                | `String`   | Additional CSS classes to be applied to the card.                                                                                                                    |
| `@api reportValidity()`                       | `Function` | Validates all inputs within the component. Returns `true` if all inputs are valid, otherwise `false`. Displays an error if validation fails.                         |
| `@api checkValidity()`                        | `Function` | Calls `reportValidity()` and returns the validation result.                                                                                                          |
| `@api setCustomValidity(errorMessage, field)` | `Function` | Sets a custom validation message for a specific input field. If `field` is provided, the error is applied to that input. Otherwise, it sets a general error message. |

## **Example Usage**

### **Template (`HTML`)**

```html
<template>
  <c-panel title="Employee Details" icon="utility:user" lwc:ref="panel">
    <div slot="actions">
      <lightning-button-group>
        <lightning-button
          variant="brand"
          label="Validate"
          onclick="{handleValidate}"
        ></lightning-button>
        <lightning-button
          variant="neutral"
          label="Check Validity"
          onclick="{handleCheckValidity}"
        ></lightning-button>
        <lightning-button
          variant="destructive"
          label="Set Custom Error"
          onclick="{handleSetError}"
        ></lightning-button>
        <lightning-button
          variant="destructive"
          label="Clear Error"
          onclick="{handleClearError}"
        ></lightning-button>
      </lightning-button-group>
    </div>

    <lightning-input
      data-input="firstName"
      label="First Name"
      onchange="{handleChange}"
    ></lightning-input>
    <lightning-input
      data-input="lastName"
      label="Last Name"
      onchange="{handleChange}"
    ></lightning-input>
  </c-panel>
</template>
```

### **Controller (`JS`)**

```javascript
import { LightningElement } from "lwc";

export default class EmployeeForm extends LightningElement {
  handleValidate() {
    this.refs.panel?.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the panel
    const isValid = this.refs.panel.reportValidity(); // Validate all inputs
    console.log("Form is valid:", isValid);
  }

  handleCheckValidity() {
    const isValid = this.refs.panel.checkValidity(); // Check if inputs are valid
    console.log("Checked validity:", isValid);
  }

  handleSetError() {
    const errorMessage = "First name is required.";
    this.refs.panel.setCustomValidity(errorMessage, "firstName"); // Set error on a specific field
    this.refs.panel.setCustomValidity("Invalid form submission"); // Set a general error
  }

  handleClearError() {
    this.refs.panel.setCustomValidity(""); // Clear the general error
    this.refs.panel.setCustomValidity("", "firstName"); // Clear the field-specific error
  }
}
```
