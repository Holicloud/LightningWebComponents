const Subscribe = Symbol("Subscribe");
const Publish = Symbol("Publish");
const Unsubscribe = Symbol("Unsubscribe");

let subscriptions = new Map();

const publish = jest.fn(({ channel, payload }) => {
  subscriptions.get(channel)?.(payload);
});

const subscribe = jest.fn(({ channel, listener }) => {
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, listener);
  }
});

const unsubscribe = jest.fn((channel) => {
  if (subscriptions.has(channel)) {
    subscriptions.delete(channel);
  } else {
    subscriptions.clear();
  }
});

const MessageChannelMixin = (Base) => {
  return class extends Base {
    [Publish](input) {
      publish(input);
    }

    [Subscribe](input) {
      subscribe(input);
    }

    [Unsubscribe](channel) {
      unsubscribe(channel);
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

const isSubscribed = (channel) => !!subscriptions?.has(channel);

export { MessageChannelMixin, isSubscribed, publish, subscribe, unsubscribe };
