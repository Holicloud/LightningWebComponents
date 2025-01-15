import {
  publish,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import { wire } from "lwc";

const isLightningElementSubclass = (Base) => {
  const baseProto = Base.prototype;

  if (typeof baseProto.dispatchEvent !== "function") {
    throw new TypeError(`${Base} must be an Element type`);
  }
};

const Subscribe = Symbol("Subscribe");
const Publish = Symbol("Publish");
const Unsubscribe = Symbol("Unsubscribe");
const Subscriptions = Symbol("Subscriptions");
const Context = Symbol("UniqueMessageContext");
const MISSING_CHANNEL = "Missing parameter: channel is required";

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

      if (!listener) {
        throw new Error("Missing parameter: listener is required");
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
      super.disconnectedCallback && super.disconnectedCallback();
    }
  };
};

MessageChannelMixin.Subscribe = Subscribe;
MessageChannelMixin.Unsubscribe = Unsubscribe;
MessageChannelMixin.Publish = Publish;
MessageChannelMixin.Context = Context;
MessageChannelMixin.Subscriptions = Subscriptions;

export { MessageChannelMixin };
