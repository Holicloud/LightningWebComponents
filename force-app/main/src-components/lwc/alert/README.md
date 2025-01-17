# Specification

- ## Public Properties

  | Property Name             | Type      | Default Value | Description                                                                 |
  | ------------------------- | --------- | ------------- | --------------------------------------------------------------------------- |
  | `variant`                 | `String`  | `"info"`      | The type of alert. Available values: `info`, `warning`, `error`, `offline`. |
  | `iconName`                | `String`  | Derived       | Overwrites the default icon for the alert variant.                          |
  | `actionMessage`           | `String`  | `null`        | The text displayed for the action link.                                     |
  | `nonCollapsible`          | `Boolean` | `false`       | Determines if the alert can be closed or not.                               |
  | `visible` (getter/setter) | `Boolean` | `true`        | Determines if the alert is visible.                                         |

- ## Events

  | Event Name | Description                                |
  | ---------- | ------------------------------------------ |
  | `action`   | Triggered when the action link is clicked. |

  ***

## Documentation

- ### Variants

  - #### Default Variant

    ```html
    <c-alert>variant info</c-alert>
    ```

  - #### Warning Variant

    ```html
    <c-alert variant="warning">variant warning</c-alert>
    ```

  - #### Error Variant

    ```html
    <c-alert variant="error">variant error</c-alert>
    ```

  - #### Offline Variant

    ```html
    <c-alert variant="offline">variant offline</c-alert>
    ```

- ### More

  - #### Action

    ```html
    <c-alert action-message="More Information" onaction="{handleAction}"
      >with action</c-alert
    >
    ```

  - #### Non-Collapsible

    ```html
    <c-alert non-collapsible>non collapsible</c-alert>
    ```

  - #### Overwriting the Icon

    ```html
    <c-alert icon-name="utility:activity">overwrite icon</c-alert>
    ```
