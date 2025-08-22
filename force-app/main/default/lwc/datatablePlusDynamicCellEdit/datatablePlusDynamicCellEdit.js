import { LightningElement, api } from "lwc";
const REMOVE_INPUT_KEYS = [8, 46];
const DEFAULT_TYPE = "lightning/input";
const COMPONENTS = {
  "lightning/checkboxGroup": () => import("lightning/checkboxGroup"),
  "lightning/combobox": () => import("lightning/combobox"),
  "lightning/input": () => import("lightning/input"),
  "lightning/recordPicker": () => import("lightning/recordPicker"),
  "lightning/textarea": () => import("lightning/textarea"),
  "c/lookup": () => import("c/lookup")
};

export default class DatatablePlusDynamicCellEdit extends LightningElement {
  @api
  get type() {
    return this._type;
  }
  set type(value) {
    if (!value) {
      value = DEFAULT_TYPE;
    }

    this.setType(value);
    this._type = value;
  }

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
    // this._props = JSON.parse(value);
    this._props = value;
  }

  _value;
  _props = {};
  renderedComponent;

  @api
  get validity() {
    if (this.type === "lightning/recordPicker") {
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

  get isLightningRecordPicker() {
    return this.type === "lightning/recordPicker";
  }

  get isLookup() {
    return this.type === "c/lookup" || this.isLightningRecordPicker;
  }

  async setType(type) {
    if (typeof type === "function") {
      const { default: ctor } = await type();
      this.renderedComponent = ctor;
    } else if (typeof type === "string") {
      if (COMPONENTS[type]) {
        const { default: ctor } = await COMPONENTS[type]();
        this.renderedComponent = ctor;
      } else {
        const { default: ctor } = await import(type);
        this.renderedComponent = ctor;
      }
    } else {
      this.renderedComponent = type;
    }

    if (!this.renderedComponent) {
      const { default: ctor } = await COMPONENTS[DEFAULT_TYPE]();
      this.renderedComponent = ctor;
    }
  }

  handleChange(e) {
    if (this.isLightningRecordPicker) {
      e.detail.value = e.detail.recordId;
    }

    //  else if (this.type === 'c/lookup') {
    // e.detail.value = e.detail.value;
    // }

    this._value = e.detail.value || null;

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
    return this.template.querySelector(`[data-id="input"]`);
  }

  handleKeyDown(event) {
    if (this.isLookup && REMOVE_INPUT_KEYS.includes(event.keyCode)) {
      this._value = null;
    }
  }
}
