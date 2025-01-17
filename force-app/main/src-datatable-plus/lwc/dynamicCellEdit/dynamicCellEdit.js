import { LightningElement, api } from "lwc";
const REMOVE_INPUT_KEYS = [8, 46];

const refByType = {
  "lightning-checkbox-group": "checkboxGroup",
  "lightning-combobox": "combobox",
  "lightning-input": "input",
  "lightning-record-picker": "recordPicker",
  "lightning-textarea": "textarea",
  "c-lookup": "lookup"
};

export default class DynamicCellEdit extends LightningElement {
  @api type = "lightning-input";

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  @api
  get props() {
    return this._props;
  }
  set props(value) {
    this._props = JSON.parse(value);
  }

  _value;
  _props = {};

  @api
  get validity() {
    if (this.lightningRecordPicker) {
      return { valid: this.inputElement.checkValidity() };
    }

    return this.inputElement?.validity;
  }

  @api
  showHelpMessageIfInvalid() {
    if (this.inputElement?.showHelpMessageIfInvalid) {
      this.inputElement?.showHelpMessageIfInvalid();
    } else {
      this.inputElement.reportValidity();
    }
  }

  @api
  focus() {
    this.inputElement?.focus();
  }

  get lightningCheckboxGroup() {
    return this.type === "lightning-checkbox-group";
  }

  get lightningInput() {
    return this.type === "lightning-input";
  }

  get lightningCombobox() {
    return this.type === "lightning-combobox";
  }

  get lightningTextarea() {
    return this.type === "lightning-textarea";
  }

  get lightningRecordPicker() {
    return this.type === "lightning-record-picker";
  }

  get cLookup() {
    return this.type === "c-lookup";
  }

  handleChange(event) {
    this._value = event.detail.value || null;

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

  handleLookupChange(e) {
    e.detail.value = e.detail.value[0];
    this.handleChange(e);
  }

  handleRecordPickerChange(e) {
    e.detail.value = e.detail.recordId;
    this.handleChange(e);
  }

  handleFocus() {
    this.dispatchEvent(
      new CustomEvent("focus", {
        bubbles: true,
        composed: true
      })
    );
  }

  handleBlur() {
    this.dispatchEvent(
      new CustomEvent("blur", {
        bubbles: true,
        composed: true
      })
    );
  }

  get inputElement() {
    return this.refs[refByType[this.type]];
  }

  handleKeyDown(event) {
    if (REMOVE_INPUT_KEYS.includes(event.keyCode)) {
      this._value = null;
    }
  }
}
