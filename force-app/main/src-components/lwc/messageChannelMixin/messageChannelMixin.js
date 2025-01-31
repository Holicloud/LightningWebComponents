import {
  publish,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import { wire } from "lwc";

const Subscribe = Symbol("Subscribe"),
  Publish = Symbol("Publish"),
  Unsubscribe = Symbol("Unsubscribe"),
  Subscriptions = Symbol("Subscriptions"),
  Context = Symbol("UniqueMessageContext"),
  MISSING_CHANNEL = "Missing parameter: channel is required";

function isLightningElementSubclass(Base) {
  const baseProto = Base.prototype;

  if (typeof baseProto.dispatchEvent !== "function") {
    throw new TypeError(`${Base} must be an Element type`);
  }
}

const MessageChannelMixin = (Base) => {
  isLightningElementSubclass(Base);
  return class extends Base {
    [Subscriptions] = new Map();

    @wire(MessageContext)
    wireMessageContext(data) {
      this[Context] = data;
    }

    [Subscribe]({
      channel,
      listener,
      subscriberOptions = { scope: APPLICATION_SCOPE }
    }) {
      const subscriptions = this[Subscriptions];

      if (!channel) {
        throw new Error(MISSING_CHANNEL);
      }

      if (typeof listener !== "function") {
        throw new Error("Invalid listener");
      }

      if (!subscriptions.has(channel)) {
        const subscription = subscribe(
          this[Context],
          channel,
          listener,
          subscriberOptions
        );
        subscriptions.set(channel, subscription);
      }
    }

    [Unsubscribe](channel) {
      if (channel) {
        const currenSubscription = this[Subscriptions].get(channel);

        if (currenSubscription) {
          unsubscribe(currenSubscription);
          this[Subscriptions].delete(channel);
        }
      } else {
        [...this[Subscriptions].keys()].forEach((subscription) =>
          this[Unsubscribe](subscription)
        );
      }
    }

    [Publish]({ channel, payload }) {
      if (!channel) {
        throw new Error(MISSING_CHANNEL);
      }

      publish(this[Context], channel, payload);
    }

    disconnectedCallback() {
      this[Unsubscribe]();
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }
  };
};

MessageChannelMixin.Context = Context;
MessageChannelMixin.Publish = Publish;
MessageChannelMixin.Subscribe = Subscribe;
MessageChannelMixin.Subscriptions = Subscriptions;
MessageChannelMixin.Unsubscribe = Unsubscribe;

export { MessageChannelMixin };
