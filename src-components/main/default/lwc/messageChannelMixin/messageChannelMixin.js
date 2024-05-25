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

const MessageChannelMixin = (Base) => {
  isLightningElementSubclass(Base);
  return class extends Base {
    [Subscriptions] = new Map();

    @wire(MessageContext)
    wireMessageContext(data) {
      this[Context] = data;
    }

    [Subscribe](handler, componentReference) {
      const subscriptions = this[Subscriptions];
      if (!subscriptions.has(componentReference)) {
        const subscription = subscribe(
          this[Context],
          componentReference,
          (message) => handler(message),
          { scope: APPLICATION_SCOPE }
        );
        subscriptions.set(componentReference, subscription);
      }
    }

    [Unsubscribe](componentReference) {
      if (componentReference) {
        const currenSubscription = this[Subscriptions].get(componentReference);
        unsubscribe(currenSubscription);
        this[Subscriptions].delete(componentReference);
      } else {
        this[Subscriptions].keys().foreach((componentReference) => {
          this[Unsubscribe](componentReference);
        });
      }
    }

    [Publish](componentReference, payload) {
      publish(this[Context], componentReference, payload);
    }
  };
};

MessageChannelMixin.Subscribe = Subscribe;
MessageChannelMixin.Unsubscribe = Unsubscribe;
MessageChannelMixin.Publish = Publish;

export { MessageChannelMixin };
