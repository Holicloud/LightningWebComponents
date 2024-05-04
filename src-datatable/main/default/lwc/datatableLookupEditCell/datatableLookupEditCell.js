import { LightningElement, api } from 'lwc';
const KEY_ARROW_BACKSPACE = 8;
const KEY_ARROW_DELETE = 46;
const REMOVE_INPUT_KEYS = [ KEY_ARROW_BACKSPACE, KEY_ARROW_DELETE ];

export default class DatatableLookupEditCell extends LightningElement {
  // @api actions;
  // @api handleAction;
  // @api errors;
  @api fieldLevelText;
  @api label;
  @api minSearchTermLength;
  @api placeholder;
  @api required;
  @api scrollAfterNItems;
  disabled;
  iconClass;
  _value;
  inputHasFocus;

  @api
  get sets() {
    return this._sets;
  }

  set sets(value) {
    this._sets = JSON.parse(value);
  }

  @api
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

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
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.inputElement.focus();
    }, 500);
  }

  handleChange(e) {
    e.preventDefault();
    e.stopPropagation();

    const [ value ] = e.detail;

    this._value = value || '';
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

  handleFocus(e) {
    this.inputHasFocus = true;
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("focus", {
        bubbles: true,
        composed: true
      })
    );
  }

  handleBlur(e) {
    this.inputHasFocus = false;
    e.preventDefault();
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
      this._value = [];
    }
  }

  get inputElement() {
    return this.template.querySelector("c-sobject-lookup");
  }
}