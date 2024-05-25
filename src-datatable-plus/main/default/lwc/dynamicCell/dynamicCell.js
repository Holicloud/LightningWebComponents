import { LightningElement, api } from "lwc";

export default class DynamicCell extends LightningElement {
  @api type = "lightning-formatted-text";

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  _value;
  @api props = {};

  isMultiEntry = false;

  get lightningFormattedNumber() {
    return this.type === "lightning-formatted-number";
  }

  get array() {
    return this.type === "array";
  }

  get record() {
    return this.type === "record";
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

  get cPicklistText() {
    return this.type === "c-picklist-text";
  }

  get cMultipicklistText() {
    return this.type === "c-multipicklist-text";
  }

  get cRecord() {
    return this.type === "c-record";
  }
}
