import { LightningElement, api } from "lwc";

export default class DatatableMultipicklistEditCell extends LightningElement {
  _typeAttributes = {};

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    this._typeAttributes = JSON.parse(value);
  }

  _value = [];

  @api
  get value() {
    return this._value.join(";");
  }
  set value(value) {
    this._value = value.length ? value.split(";") : [];
  }

  @api
  get validity() {
    return this.checkBoxElement.validity;
  }

  @api
  showHelpMessageIfInvalid() {
    this.checkBoxElement.showHelpMessageIfInvalid();
  }

  @api
  focus() {
    this.checkBoxElement.focus();
  }

  _handleChange(e) {
    e.stopPropagation();
    this._value = e.detail.value;

    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value
        }
      })
    );
  }

  _handleFocus(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("focus", {
        bubbles: true,
        composed: true
      })
    );
  }

  _handleBlur(e) {
    e.stopPropagation();

    this.dispatchEvent(
      new CustomEvent("blur", {
        bubbles: true,
        composed: true
      })
    );
  }

  get checkBoxElement() {
    return this.template.querySelector("lightning-checkbox-group");
  }
}
