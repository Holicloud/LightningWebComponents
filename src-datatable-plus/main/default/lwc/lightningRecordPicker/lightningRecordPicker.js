import { LightningElement, api } from "lwc";
const KEY_ARROW_BACKSPACE = 8;
const KEY_ARROW_DELETE = 46;
const REMOVE_INPUT_KEYS = [KEY_ARROW_BACKSPACE, KEY_ARROW_DELETE];

export default class LightningRecordPicker extends LightningElement {
  _typeAttributes = {};
  inputHasFocus;

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
    // there is no valid object on the input so we use checkValidity() instead
    return { valid: this.inputElement.checkValidity() };
  }

  @api
  showHelpMessageIfInvalid() {
    // there is no showHelpMessageifInvalid so we use reportValidity instead
    this.inputElement.reportValidity();
  }

  @api
  focus() {
    // this.template.querySelector('div').focus();
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.inputElement.focus();
    }, 500);
  }

  // private methods

  _handleChange(e) {
    e.stopPropagation();
    this._value = e.detail.recordId || "";

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
    this.currentlyFocusedElement = e.target;
    this.inputHasFocus = true;
    this.dispatchEvent(
      new CustomEvent("focus", {
        bubbles: true,
        composed: true
      })
    );
  }

  _handleBlur(e) {
    this.inputHasFocus = false;
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("blur", {
        bubbles: true,
        composed: true
      })
    );
  }

  _handleReady() {
    this.focus();
  }

  handleKeyDown(event) {
    if (REMOVE_INPUT_KEYS.includes(event.keyCode) && this.inputHasFocus) {
      this.inputElement.clearSelection();
      this._value = "";
    }
  }

  get inputElement() {
    return this.template.querySelector("lightning-record-picker");
  }
}
