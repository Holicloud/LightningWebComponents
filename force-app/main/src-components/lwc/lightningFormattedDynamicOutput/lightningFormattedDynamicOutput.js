import { LightningElement, api } from "lwc";

export default class LightningFormattedDynamicOutput extends LightningElement {
  @api type;
  @api value;
  @api props = {};

  get lightningFormattedNumber() {
    return this.type === "lightning-formatted-number";
  }

  get lightningFormattedText() {
    return this.type === "lightning-formatted-text";
  }

  get lightningFormattedTime() {
    return this.type === "lightning-formatted-time";
  }

  get lightningFormattedDateTime() {
    return this.type === "lightning-formatted-date-time";
  }

  get lightningFormattedEmail() {
    return this.type === "lightning-formatted-email";
  }

  get lightningFormattedUrl() {
    return this.type === "lightning-formatted-url";
  }

  get lightningFormattedRichText() {
    return this.type === "lightning-formatted-rich-text";
  }
}
