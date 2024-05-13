import { LightningElement, api } from "lwc";

export default class DatatablePicklistEditCell extends LightningElement {
  _typeAttributes = {};

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    this._typeAttributes = JSON.parse(value);
  }

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  // public methods

  @api
  get validity() {
    return this.inputElement.validity;
  }

  @api
  showHelpMessageIfInvalid() {
    this.inputElement.showHelpMessageIfInvalid();
  }

  @api
  focus() {
    this.inputElement.focus();
  }

  // private methods

  _handleChange(e) {
    e.stopPropagation();

    this._value = e.detail.value;

    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: {
          value: this._value
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

  get inputElement() {
    return this.template.querySelector("lightning-combobox");
  }
}
