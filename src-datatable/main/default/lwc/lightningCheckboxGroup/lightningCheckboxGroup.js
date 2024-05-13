import { LightningElement, api } from "lwc";

export default class LightningCheckboxGroup extends LightningElement {
  @api value = "";
  _typeAttributes = {};

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    this._typeAttributes = JSON.parse(value);
  }

  get formattedValue() {
    const options = this._typeAttributes?.options;
    return !this.value || !options?.length
      ? ""
      : this.value
          .split(";")
          .map(
            (singleValue) =>
              options.find(({ value }) => value === singleValue).label
          )
          .join(";");
  }
}
