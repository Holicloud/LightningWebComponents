import { LightningElement, api } from 'lwc';

export default class LightningFormattedText extends LightningElement {
  @api value = "";

  _typeAttributes = {};

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    this._typeAttributes = value;
  }

}