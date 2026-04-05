import publishEvent from "@salesforce/apex/EmpApiMixinController.publishEvent";
import {
  subscribe,
  unsubscribe,
  onError,
  setDebugFlag,
  isEmpEnabled
} from "lightning/empApi";

const Subscribe = Symbol("Subscribe"),
  Publish = Symbol("Publish"),
  Unsubscribe = Symbol("Unsubscribe"),
  OnError = Symbol("OnError"),
  SetDebugFlag = Symbol("SetDebugFlag"),
  IsEmpEnabled = Symbol("IsEmpEnabled"),
  Subscriptions = Symbol("Subscriptions"),
  MISSING_CHANNEL = "Missing parameter: channel is required";

const EmpApiMixin = (Base) => {
  isLightningElementSubclass(Base);
  return class extends Base {
    [Subscriptions] = new Map();

    async [Subscribe]({ channel, replayId = -1, listener }) {
      const subscriptions = this[Subscriptions];

      if (!channel) {
        throw new Error(MISSING_CHANNEL);
      }

      if (typeof listener !== "function") {
        throw new Error("Invalid listener");
      }

      if (!subscriptions.has(channel)) {
        const subscription = await subscribe(channel, replayId, listener);
        subscriptions.set(channel, subscription);
        return subscription;
      }
      return subscriptions.get(channel);
    }

    async [Publish]({ channel, fields = {} }) {
      if (!channel) {
        throw new Error(MISSING_CHANNEL);
      }

      const apiName = channel.replace(/^\/event\//, "");

      return publishEvent({ eventName: apiName, payload: fields });
    }

    [Unsubscribe](channel) {
      if (channel) {
        const currentSubscription = this[Subscriptions].get(channel);

        if (currentSubscription) {
          unsubscribe(currentSubscription, (response) => {
            if (response && response.successful) {
              this[Subscriptions].delete(channel);
            }
          });
        }
      } else {
        [...this[Subscriptions].keys()].forEach((subChannel) =>
          this[Unsubscribe](subChannel)
        );
      }
    }

    [OnError](listener) {
      if (typeof listener !== "function") {
        throw new Error("Invalid listener");
      }
      onError(listener);
    }

    [SetDebugFlag](enable) {
      setDebugFlag(enable);
    }

    async [IsEmpEnabled]() {
      return isEmpEnabled();
    }

    disconnectedCallback() {
      this[Unsubscribe]();
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }
  };
};

function isLightningElementSubclass(Base) {
  const baseProto = Base.prototype;

  if (typeof baseProto.dispatchEvent !== "function") {
    throw new TypeError(`${Base} must be an Element type`);
  }
}

export { EmpApiMixin };

EmpApiMixin.Subscribe = Subscribe;
EmpApiMixin.Publish = Publish;
EmpApiMixin.Unsubscribe = Unsubscribe;
EmpApiMixin.OnError = OnError;
EmpApiMixin.SetDebugFlag = SetDebugFlag;
EmpApiMixin.IsEmpEnabled = IsEmpEnabled;
EmpApiMixin.Subscriptions = Subscriptions;
