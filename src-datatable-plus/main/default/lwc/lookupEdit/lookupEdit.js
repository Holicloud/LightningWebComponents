import { LightningElement, api, track } from "lwc";
const KEY_ARROW_BACKSPACE = 8;
const KEY_ARROW_DELETE = 46;
const REMOVE_INPUT_KEYS = [KEY_ARROW_BACKSPACE, KEY_ARROW_DELETE];

export default class LookupEdit extends LightningElement {
  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    this._typeAttributes = JSON.parse(value);
  }

  @api
  get value() {
    return this.state.value;
  }
  set value(value) {
    this.state.value = value;
    this._value = value;
  }

  @track state = {};

  _value;
  inputHasFocus;
  isMultiEntry = false;
  _typeAttributes = {};

  // public methods

  @api
  get validity() {
    return this.refs.input.validity;
  }

  @api
  showHelpMessageIfInvalid() {
    this.refs.input.showHelpMessageIfInvalid();
  }

  @api
  focus() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.refs.input.focus();
    }, 500);
  }

  // private methods

  _handleChange(e) {
    e.stopPropagation();

    const value = e.detail.value;
    this._value = value?.length ? value[0] : "";
    this.state.value = this._value;
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

  handleKeyDown(event) {
    if (REMOVE_INPUT_KEYS.includes(event.keyCode) && this.inputHasFocus) {
      this._value = "";
    }
  }
}
