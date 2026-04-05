# EmpApiMixin

A reusable Lightning Web Component mixin that encapsulates the `lightning/empApi` functionality, providing a clean, symbol-based API for subscribing to and publishing Platform Events.

For detailed information on the underlying Salesforce API, refer to the [official documentation](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-emp-api.html?type=Develop#usage).

## Specification

### Properties

| **Property**    | **Type** | **Description**                                                                                                                                |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Subscriptions` | `Map`    | Internal registry of active subscriptions. The key is the channel string (e.g., `/event/MyEvent__e`) and the value is the subscription object. |

### Methods

| **Method**               | **Description**                                                                                                                                                           | **Parameters**                                                         | **Throws**                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| `[Subscribe]`            | Subscribes to a platform event channel. Automatically avoids duplicate subscriptions for the same channel.                                                                | `{ channel: string, replayId: number (optional), listener: function }` | `channel` is missing or `listener` is invalid |
| `[Unsubscribe]`          | Unsubscribes from a specific channel, or all active channels if no parameter is provided.                                                                                 | `channel` (string, optional)                                           | None                                          |
| `[Publish]`              | Publishes a Platform Event via the `EmpApiMixinController` Apex bridge.                                                                                                   | `{ channel: string, fields: object }`                                  | `channel` is missing                          |
| `[OnError]`              | Registers a callback to handle global EMP API errors.                                                                                                                     | `listener` (function)                                                  | `listener` is invalid                         |
| `[SetDebugFlag]`         | Enables or disables EMP API debug logging in the browser console.                                                                                                         | `enable` (boolean)                                                     | None                                          |
| `[IsEmpEnabled]`         | Asynchronously checks if the EMP API is currently enabled for the user/environment.                                                                                       | None                                                                   | None                                          |
| `disconnectedCallback()` | Automatically unsubscribes from all active channels when the component is removed from the DOM. If a custom `disconnectedCallback` is defined, it will still be executed. | None                                                                   | None                                          |

## Usage

### Example Implementation

```javascript
import { LightningElement } from "lwc";
import { EmpApiMixin } from "c/empApiMixin";

export default class MyEventComponent extends EmpApiMixin(LightningElement) {
  channel = "/event/MyPlatformEvent__e";

  connectedCallback() {
    // Automatically check if enabled and subscribe
    this[EmpApiMixin.IsEmpEnabled]().then((isEnabled) => {
      if (isEnabled) {
        this.handleSubscribe();
      }
    });

    // Register global error handler
    this[EmpApiMixin.OnError]((error) => {
      console.error("EMP API Error:", error);
    });
  }

  handleSubscribe() {
    this[EmpApiMixin.Subscribe]({
      channel: this.channel,
      replayId: -1,
      listener: (payload) => {
        console.log("Received event:", JSON.stringify(payload));
      }
    });
  }

  handlePublish() {
    this[EmpApiMixin.Publish]({
      channel: this.channel,
      fields: {
        Message__c: "Hello from Mixin!"
      }
    });
  }

  handleUnsubscribe() {
    this[EmpApiMixin.Unsubscribe](this.channel);
  }
}
```

## Internal Dependencies

- **Apex Service:** `EmpApiMixinController.cls` (Required for the `[Publish]` method).
- **LWC Modules:** `lightning/empApi`.
