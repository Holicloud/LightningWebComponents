import { MessageChannelMixin } from "c/messageChannelMixin";
// import { CacheMixin } from 'c/cacheMixin';
import { Mixer } from "c/utils";
// import { api } from "lwc";
import channel from "@salesforce/messageChannel/PrimaryMessageChannel__c";

export default class MessageChannelMixinBasic extends new Mixer().mix(
  MessageChannelMixin
  // [CacheMixin, {
  //   cacheable: ['data', 'message'],
  //   expirationTime: 1,
  //   componentName: 'MessageChannelMixinBasic'
  // }]
) {
  // @api cacheMixinId = '123';
  message = "";

  data = {
    input: ""
  };

  handleClearCache() {
    // this[CacheMixin.Clear]();
  }

  connectedCallback() {
    // this[CacheMixin.Config]();
    console.log(this.data);
    this[MessageChannelMixin.Subscribe]({
      listener: this.handleMessage.bind(this),
      channel
    });
  }

  handleInputChange(event) {
    this.data.input = event.detail.value;
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
