import { LightningElement, api } from "lwc";

export default class DatatableTimeCellEdit extends LightningElement {
  @api placeholder;

  @api
  get value() {
    const [hours, minutes, seconds] = this._value.slice(0, -4).split(":");
    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }
  set value(value) {
    const date = new Date(value);
    const validDate = date instanceof Date && !isNaN(date.getTime());

    this._value = validDate ? date.toISOString()?.split("T")[1] : "";
  }

  _value;

  @api
  get validity() {
    return this.template.querySelector("lightning-input").validity;
  }

  @api
  showHelpMessageIfInvalid() {
    this.template.querySelector("lightning-input").showHelpMessageIfInvalid();
  }

  @api
  focus() {
    this.template.querySelector("lightning-input").focus();
  }

  _handleChange(e) {
    this._value = e.detail.value;
    e.stopPropagation();

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
}
