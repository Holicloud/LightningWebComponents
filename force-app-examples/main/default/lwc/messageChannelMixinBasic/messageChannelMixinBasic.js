import channel from "@salesforce/messageChannel/PrimaryMessageChannel__c";
import { MessageChannelMixin } from "c/messageChannelMixin";
import { LightningElement } from "lwc";

export default class MessageChannelMixinBasic extends MessageChannelMixin(
  LightningElement
) {
  message = "";

  handleMessage(payload) {
    this.message = payload.value;
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
  }

  handleUnsubscribe() {
    this[MessageChannelMixin.Unsubscribe](channel);
  }

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleMessage.bind(this),
      channel
    });
  }
}
