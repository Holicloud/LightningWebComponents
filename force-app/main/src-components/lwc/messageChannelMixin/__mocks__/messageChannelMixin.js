const Subscribe = Symbol("Subscribe");
const Publish = Symbol("Publish");
const Unsubscribe = Symbol("Unsubscribe");

let subscriptions = new Map();

const publish = jest.fn(({ channel, payload }) => {
  subscriptions.get(channel)?.(payload);
});

const subscribe = jest.fn(({ channel, handler }) => {
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, handler);
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
  };
};

MessageChannelMixin.Subscribe = Subscribe;
MessageChannelMixin.Unsubscribe = Unsubscribe;
MessageChannelMixin.Publish = Publish;

const isSubscribed = (channel) => !!subscriptions?.has(channel);

export { MessageChannelMixin, isSubscribed, publish, subscribe, unsubscribe };
