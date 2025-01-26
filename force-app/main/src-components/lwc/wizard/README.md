# Specification

## Properties

| **Property**       | **Type**         | **Description**                                                                                                 |
| ------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `@api header`      | `String`         | The header displayed at the top of the wizard. Defaults to an empty string.                                     |
| `@api variant`     | `String`         | Specifies the style variant of the wizard. Accepted values are `base`, `base-shaded`, and `path`. Defaults to `base`. |
| `@api currentStep`  | `String`         | Specifies the currently active step by its `name` attribute.                                                    |

## Events

| **Event Name**   | **Description**                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `change`         | Fired when the current step changes. The event detail includes `oldStep` (previous step) and `currentStep` (new step). |
| `complete`       | Fired when the wizard is finished (i.e., the user reaches the end of the steps).                     |

## Example Usage

### Basic Wizard

```html
<c-wizard
  header="My Account Wizard"
  variant="base"
  current-step="step-1"
>
  <c-wizard-step label="Enter Account" name="step-1">
    <lightning-input label="Account Name"></lightning-input>
    <lightning-input label="Account Type"></lightning-input>
  </c-wizard-step>
  <c-wizard-step label="Enter Case" name="step-2">
    <lightning-input label="Case Name"></lightning-input>
    <lightning-input label="Case Type"></lightning-input>
  </c-wizard-step>
  <c-wizard-step label="Step 3" name="step-3"> Good Bye </c-wizard-step>
</c-wizard>
```
