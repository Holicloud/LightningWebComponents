# `<c-wizard-step>` Component Documentation

The `<c-wizard-step>` component represents an individual step within a `<c-wizard>` component. It allows configuring navigation behavior, validation, and UI elements for each step in the wizard.

## **Attributes**

| Attribute              | Type       | Description                                                                                                                                |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`                | `String`   | The display label of the step.                                                                                                             |
| `name`                 | `String`   | A unique identifier for the step.                                                                                                          |
| `hide-next-button`     | `Boolean`  | If present, hides the "Next" button for this step.                                                                                         |
| `hide-previous-button` | `Boolean`  | If present, hides the "Previous" button for this step.                                                                                     |
| `validate`             | `Function` | A validation function that runs before moving to the next step. It should return `true` if the step is valid or throw an error if invalid. |

## **Usage Example**

```html
<c-wizard-step label="Enter Account" name="step-2" validate="{validateStep}">
  <p>Step with validation</p>
  <lightning-input label="Account Name" required></lightning-input>
  <lightning-input label="Account Type" required></lightning-input>
</c-wizard-step>
```

## **Validation Example**

The `validate` function ensures that all required inputs in the step are filled before proceeding:

```javascript
validateStep = (name) => {
  const step = [...this.template.querySelectorAll(`c-wizard-step`)].find(
    (stepElement) => stepElement.name === name
  );
  const isValid = [...step.querySelectorAll("lightning-input")].reduce(
    (isValidSoFar, input) => {
      input.reportValidity();
      return isValidSoFar && input.checkValidity();
    },
    true
  );

  if (!isValid) {
    throw new Error("Fill your input and try again");
  }

  return isValid;
};
```
