# Specification

- ## Public Properties

  | Property Name      | Type      | Default Value | Description                                          |
  | ------------------ | --------- | ------------- | ---------------------------------------------------- |
  | `title`            | `String`  | `Error`       | The title displayed in the accordion.                |
  | `isNonDismissable` | `Boolean` | `false`       | Determines if the alert can be dismissed or not.     |
  | `errors`           | `Array`   | `[]`          | List of errors to be displayed within the accordion. |
  | `isHidden`         | `Boolean` | `false`       | Determines if the accordion is visible.              |

- ## Events

  | Event Name | Description                                |
  | ---------- | ------------------------------------------ |
  | `dismiss`  | Triggered when the accordion is dismissed. |

---

## Documentation

- ### Default Usage

  ```html
  <c-errors-accordion errors="{errors}"></c-errors-accordion>
  ```

- ### Non Dismissable

  ```html
  <c-errors-accordion
    title="Something went wrong"
    is-non-dismissable
    errors="{errors}"
  ></c-errors-accordion>
  ```

- ### Using Slots

  ```html
  <c-errors-accordion errors="{errors}">
    <lightning-button
      variant="Destructive"
      label="Slot Item"
    ></lightning-button>
    <div slot="actions">
      <lightning-button
        variant="brand"
        icon-name="utility:undo"
        label="Return"
      ></lightning-button>
      <lightning-button variant="success" label="Ok"></lightning-button>
    </div>
  </c-errors-accordion>
  ```
