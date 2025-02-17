# Specification

- ## Public Properties

  | Property Name      | Type      | Default Value | Description                                                                                                                                                                                                                                                                                                                                                                    |
  | ------------------ | --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `title`            | `String`  | `null`        | The title displayed with the illustration.                                                                                                                                                                                                                                                                                                                                     |
  | `size`             | `String`  | `null`        | Defines the illustration size. Available values: `small`, `large`.                                                                                                                                                                                                                                                                                                             |
  | `hideIllustration` | `Boolean` | `false`       | Determines if the illustration is hidden.                                                                                                                                                                                                                                                                                                                                      |
  | `primaryColor`     | `String`  | `null`        | Sets the primary fill color of the illustration.                                                                                                                                                                                                                                                                                                                               |
  | `secondaryColor`   | `String`  | `null`        | Sets the secondary fill color of the illustration.                                                                                                                                                                                                                                                                                                                             |
  | `primaryStroke`    | `String`  | `null`        | Sets the primary stroke color of the illustration.                                                                                                                                                                                                                                                                                                                             |
  | `secondaryStroke`  | `String`  | `null`        | Sets the secondary stroke color of the illustration.                                                                                                                                                                                                                                                                                                                           |
  | `variant`          | `String`  | `desert`      | Defines the illustration variant. Available values: `going-camping`, `maintenance`, `desert`, `open-road`, `no-access`, `no-connection`, `not-available-in-lightning`, `page-not-available`, `walkthrough-not-available`, `fishing-deals`, `lake-mountain`, `no-events`, `no-task`, `setup`, `gone-fishing`, `no-access-2`, `no-content`, `no-preview`, `preview`, `research`. |

  ***

## Documentation

- ### Variants

  - #### Default Variant (Desert)

    ```html
    <c-illustration></c-illustration>
    ```

  - #### Custom Variant (Maintenance)

    ```html
    <c-illustration variant="maintenance"></c-illustration>
    ```

- ### Customization

  - #### Setting Title

    ```html
    <c-illustration title="Maintenance Mode"></c-illustration>
    ```

  - #### Changing Size

    ```html
    <c-illustration size="large"></c-illustration>
    ```

  - #### Hiding the Illustration

    ```html
    <c-illustration hide-illustration></c-illustration>
    ```

  - #### Custom Colors

    ```html
    <c-illustration
      primary-color="#1E3A8A"
      secondary-color="#60A5FA"
    ></c-illustration>
    ```

  - #### Custom Stroke Colors

    ```html
    <c-illustration
      primary-stroke="#FACC15"
      secondary-stroke="#F43F5E"
    ></c-illustration>
    ```
