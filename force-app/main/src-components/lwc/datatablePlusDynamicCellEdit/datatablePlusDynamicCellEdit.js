import { renderComponent } from "c/datatablePlusExtendedTypes";
import { LightningElement, api } from "lwc";

const COMPONENTS = {
  "lightning/checkboxGroup": () => import("lightning/checkboxGroup"),
  "lightning/combobox": () => import("lightning/combobox"),
  "lightning/input": () => import("lightning/input"),
  "lightning/recordPicker": () => import("lightning/recordPicker"),
  "lightning/textarea": () => import("lightning/textarea"),
  "c/lookup": () => import("c/lookup")
};
const DEFAULT_TYPE = "lightning/input";
const REMOVE_INPUT_KEYS = [8, 46];

export default class DatatablePlusDynamicCellEdit extends LightningElement {
  @api label;

  @api props = {};

  @api type = DEFAULT_TYPE;

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
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get inputElement() {
    return this.template.querySelector(`[data-id="input"]`);
  }

  get isLightningRecordPicker() {
    return this.type === "lightning/recordPicker";
  }

  get isLookup() {
    return this.type === "c/lookup" || this.isLightningRecordPicker;
  }

  handleBlur() {
    this.dispatchEvent(
      new CustomEvent("blur", {
        bubbles: true,
        composed: true
      })
    );
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

  handleKeyDown(event) {
    if (this.isLookup && REMOVE_INPUT_KEYS.includes(event.keyCode)) {
      this._value = null;
    }
  }

  async setType() {
    if (this.renderedComponent) {
      return;
    }

    this.renderedComponent = await renderComponent(
      this.type,
      COMPONENTS,
      DEFAULT_TYPE
    );
  }

  connectedCallback() {
    this.setType();
  }

  @api
  focus() {
    this.inputElement?.focus();
  }

  @api
  showHelpMessageIfInvalid() {
    if (this.inputElement?.showHelpMessageIfInvalid) {
      this.inputElement?.showHelpMessageIfInvalid();
    } else {
      this.inputElement.reportValidity();
    }
  }
}
