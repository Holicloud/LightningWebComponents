import { LightningElement } from "lwc";
import { MessageChannelMixin } from "c/messageChannelMixin";
import channel from "@salesforce/messageChannel/PrimaryMessageChannel__c";

export default class MessageChannelMixinBasic extends MessageChannelMixin(
  LightningElement
) {
  message = "";

  connectedCallback() {
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleMessage.bind(this),
      channel
    });
  }

  handleMessage(payload) {
    this.message = payload.value;
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

  handlePublishMessage() {
    this[MessageChannelMixin.Publish]({
      channel: channel,
      payload: {
        value: this.template.querySelector("lightning-input").value
      }
    });
  }
}
