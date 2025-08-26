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
  @api type = DEFAULT_TYPE;
  @api label;

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  @api props = {};

  _value;
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

  connectedCallback() {
    this.setType();
  }

  get isLightningRecordPicker() {
    return this.type === "lightning/recordPicker";
  }

  get isLookup() {
    return this.type === "c/lookup" || this.isLightningRecordPicker;
  }

  async setType() {
    if (this.renderedComponent) {
      return;
    }

    if (typeof this.type === "function") {
      if (this.type.prototype instanceof LightningElement) {
        this.renderedComponent = this.type;
      } else {
        const { default: ctor } = await this.type();
        this.renderedComponent = ctor;
      }
    } else if (typeof this.type === "string") {
      if (COMPONENTS[this.type]) {
        const { default: ctor } = await COMPONENTS[this.type]();
        this.renderedComponent = ctor;
      } else {
        const { default: ctor } = await import(this.type);
        this.renderedComponent = ctor;
      }
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
