import { LightningElement, api } from "lwc";

export default class ArrayCell extends LightningElement {
  @api value;
  _typeAttributes = {};

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    if (value) {
      this._typeAttributes = value;
    }
  }

  get formattedValue() {
    const { options, separator = ';' } = this._typeAttributes;

    const isArray = Array.isArray(this.value);

    if ((!this.value || (isArray && !this.value.length)) || !options?.length) {
      return "";
    }

    let selectedValues = this.value;

    if (!isArray) {
      selectedValues = [ selectedValues ];
    }
    

    return options
      .filter(({ value }) => selectedValues.includes(value))
      .map(({ label }) => label)
      .join(separator);
  }
}
