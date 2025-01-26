# Specification

## Properties

| **Property**    | **Type**         | **Description**                                                                                                                |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Subscriptions` | `Map`            | Stores subscriptions for different message channels. The key is the message channel, and the value is the subscription object. |
| `Context`       | `MessageContext` | Stores the context for the message service, provided by the `@wire(MessageContext)` decorator.                                 |

## Methods

| **Method**               | **Description**                                                                                                                                                         | **Parameters**                                                                          | **Throws**                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| `[Subscribe]`            | Subscribes to a message channel with a specified listener and options.                                                                                                  | `channel` (`string`), `listener` (`function`), `subscriberOptions` (`object`, optional) | `channel` or `listener` is missing |
| `[Unsubscribe]`          | Unsubscribes from a specific message channel or all channels if no channel is specified.                                                                                | `channel` (`string`, optional)                                                          | None                               |
| `[Publish]`              | Publishes a message to a message channel with the provided payload.                                                                                                     | `channel` (`string`), `payload` (`object`)                                              | `channel` is missing               |
| `disconnectedCallback()` | Automatically unsubscribes from all channels when the component is disconnected from the DOM. If a custom `disconnectedCallback` is defined, it will still be executed. | None                                                                                    | None                               |

## Usage

### Example Usage

```javascript
import { LightningElement } from "lwc";
import messageChannelA from "@salesforce/messageChannel/MessageChannelA__c";
import messageChannelB from "@salesforce/messageChannel/MessageChannelB__c";
import { MessageChannelMixin } from "c/messageChannelMixin";

export default class ExampleComponent extends MessageChannelMixin(
  LightningElement
) {
  connectedCallback() {
    // Subscribe to channels
    this[MessageChannelMixin.Subscribe](
      this.handleMessageA.bind(this),
      messageChannelA
    );
    this[MessageChannelMixin.Subscribe](this.handleMessageB, messageChannelB);
  }

  handleMessageA(payload) {
    console.log("Message from Channel A:", payload.message);
  }

  handleMessageB = (payload) => {
    console.log("Message from Channel B:", payload.message);
  };

  publishToChannel() {
    // Publish a message to channel
    this[MessageChannelMixin.Publish]({
      channel: messageChannelA,
      payload: {
        message: "hello world"
      }
    });
  }

  unsubscribeToAChannel() {
    this[MessageChannelMixin.Unsubscribe](messageChannelB);
  }

  unsubscribeToAllChannels() {
    this[MessageChannelMixin.Unsubscribe]();
  }

  disconnectedCallback() {
    // This method will still run, but no need to handle unsubscription
    console.log("Component is disconnected");
  }
}
```
