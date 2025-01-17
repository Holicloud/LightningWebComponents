# 📡 **MessageChannelMixin** Documentation

The `MessageChannelMixin` streamlines communication between Lightning Web Components (LWCs) using Salesforce's **Lightning Message Service (LMS)**. It provides intuitive methods for subscribing to, publishing, and unsubscribing from message channels.

---

## 🛠️ **Key Features**

- **📩 Easy Subscriptions**: Listen to messages from multiple message channels effortlessly.
- **📤 Intuitive Publishing**: Send messages to specified channels with minimal code.
- **🧹 Efficient Unsubscriptions**: Clean up subscriptions automatically or selectively.

---

## 📋 **How It Works**

### 📌 **Message Channels**

Message channels, such as `messageChannelA` and `messageChannelB`, are communication pathways used to transmit data between components.

Import them like this:

```javascript
import messageChannelA from "@salesforce/messageChannel/MessageChannelA__c";
import messageChannelB from "@salesforce/messageChannel/MessageChannelB__c";
```

### 📌 **Using the Mixin**

1. **Include the Mixin in Your Component**

   ```javascript
   import { MessageChannelMixin } from "c/messageChannelMixin";
   ```

2. **Subscribe to Multiple Channels**  
   Add subscriptions in `connectedCallback` to listen for messages from one or more channels:

   ```javascript
   connectedCallback() {
       this[MessageChannelMixin.Subscribe](this.handleAMessage, messageChannelA);
       this[MessageChannelMixin.Subscribe](this.handleBMessage, messageChannelB);
   }

   handleAMessage(message) {
       console.log('Message from A:', message);
   }

   handleBMessage(message) {
       console.log('Message from B:', message);
   }
   ```

3. **Publish Messages**  
   Use `MessageChannelMixin.Publish` to send messages to specific channels:

   ```javascript
   handlePublishA() {
       this[MessageChannelMixin.Publish](messageChannelA, { message: 'Hello World A' });
   }

   handlePublishB() {
       this[MessageChannelMixin.Publish](messageChannelB, { message: 'Hello World B' });
   }
   ```

4. **Unsubscribe from Channels**  
   Ensure proper cleanup by unsubscribing in `disconnectedCallback`. You can either:
   - Unsubscribe from **all channels**:
     ```javascript
     disconnectedCallback() {
         this[MessageChannelMixin.Unsubscribe]();
     }
     ```
   - Or unsubscribe from **specific channels**:
     ```javascript
     disconnectedCallback() {
         this[MessageChannelMixin.Unsubscribe](messageChannelA);
         this[MessageChannelMixin.Unsubscribe](messageChannelB);
     }
     ```

---

## 🌟 **Benefits**

- **📈 Improved Readability**: Clear, concise API for LMS communication.
- **♻️ Reusability**: Centralized logic reusable across multiple components.
- **🛡️ Memory Safety**: Prevents memory leaks with robust unsubscription handling.

---

## ⚙️ **Key Methods**

| **Method**                        | **Purpose**                                     |
| --------------------------------- | ----------------------------------------------- |
| `MessageChannelMixin.Subscribe`   | Subscribe to a specific message channel.        |
| `MessageChannelMixin.Publish`     | Publish messages to a specific message channel. |
| `MessageChannelMixin.Unsubscribe` | Unsubscribe from one or all message channels.   |

---

## 🚀 **Quick Example**

Here’s a concise example of a component using `MessageChannelMixin`:

```javascript
import { LightningElement } from "lwc";
import messageChannelA from "@salesforce/messageChannel/MessageChannelA__c";
import messageChannelB from "@salesforce/messageChannel/MessageChannelB__c";
import { MessageChannelMixin } from "c/messageChannelMixin";

export default class ExampleComponent extends MessageChannelMixin(
  LightningElement
) {
  connectedCallback() {
    this[MessageChannelMixin.Subscribe](this.handleMessageA, messageChannelA);
    this[MessageChannelMixin.Subscribe](this.handleMessageB, messageChannelB);
  }

  disconnectedCallback() {
    this[MessageChannelMixin.Unsubscribe](); // Unsubscribes from all
  }

  handleMessageA(message) {
    console.log("Message from Channel A:", message);
  }

  handleMessageB(message) {
    console.log("Message from Channel B:", message);
  }

  publishMessageToA() {
    this[MessageChannelMixin.Publish](messageChannelA, { key: "valueA" });
  }
}
```

This approach ensures reliable communication while keeping your code clean and maintainable. 🎉
