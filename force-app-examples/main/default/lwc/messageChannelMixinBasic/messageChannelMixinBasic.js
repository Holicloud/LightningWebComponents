import channel from "@salesforce/messageChannel/PrimaryMessageChannel__c";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { LightningElement } from "lwc";

export default class MessageChannelMixinBasic extends MessageChannelMixin(
  LightningElement
) {
  events = [];
  isSubscribed = false;

  get hasEvents() {
    return this.events.length > 0;
  }

  get isNotSubscribed() {
    return !this.isSubscribed;
  }

  get statusVariant() {
    return this.isSubscribed ? "success" : "error";
  }

  get subscriptionStatus() {
    return this.isSubscribed ? "Subscribed" : "Unsubscribed";
  }

  handleMessage(payload) {
    this.events = [JSON.stringify(payload, null, 2), ...this.events];
  }

  handlePublishMessage() {
    this[MessageChannelMixin.Publish]({
      channel: channel,
      payload: {
        value: this.template.querySelector("lightning-input").value
      }
    });
  }

  handleSubscribe() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleMessage.bind(this),
      channel
    });
    this.isSubscribed = true;
  }

  handleUnsubscribe() {
    this[MessageChannelMixin.Unsubscribe](channel);
    this.isSubscribed = false;
  }

  connectedCallback() {
    this.handleSubscribe();
  }
}
