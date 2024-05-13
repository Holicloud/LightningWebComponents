import { LightningElement, api } from "lwc";

export default class LightningFormattedNumber extends LightningElement {
  _typeAttributes = {};

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    this._typeAttributes = value;
  }

  @api value;
}
