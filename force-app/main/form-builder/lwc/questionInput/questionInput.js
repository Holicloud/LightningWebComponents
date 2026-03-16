import { LightningElement, api } from "lwc";

const DEFAULT_TYPE = "lightning/input";
const COMPONENTS = {
  "lightning/checkboxGroup": () => import("lightning/checkboxGroup"),
  "lightning/combobox": () => import("lightning/combobox"),
  "lightning/input": () => import("lightning/input"),
  "lightning/textarea": () => import("lightning/textarea"),
  "lightning/dualListbox": () => import("lightning/dualListbox"),
  "lightning/radioGroup": () => import("lightning/radioGroup")
};

/**
 * Dynamically renders and resolves a component constructor based on the provided type.
 *
 * @async
 * @function renderComponent
 * @param {Function|string} type - The component type to render. Can be a component constructor function or a string identifier.
 * @param {Object} components - A map of available components where keys are component identifiers and values are dynamic import functions.
 * @param {string} defaultType - The fallback component type to use if the specified type cannot be resolved.
 * @returns {Promise<Function>} A promise that resolves to the component constructor function.
 */
async function renderComponent(type, components, defaultType) {
  let result;

  try {
    if (typeof type === "function") {
      if (type.prototype instanceof LightningElement) {
        result = type;
      } else {
        const { default: ctor } = await type();
        result = ctor;
      }
    } else if (typeof type === "string") {
      if (components[type]) {
        const { default: ctor } = await components[type]();
        result = ctor;
      }
    }
  } catch (error) {
    console.warn(`Failed to render component: ${type}`, error);
  }

  if (!result) {
    const { default: ctor } = await components[defaultType]();
    result = ctor;
  }

  return result;
}

export default class QuestionInput extends LightningElement {
  @api label;

  @api props = {};

  @api type = DEFAULT_TYPE;

  @api
  get validity() {
    return this.inputElement?.validity;
  }

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
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

  _value;
  renderedComponent;

  get inputElement() {
    return this.template.querySelector(`[data-id="input"]`);
  }

  handleBlur() {
    this.dispatchEvent(new CustomEvent("blur"));
  }

  handleChange(e) {
    e.preventDefault();
    this._value = e.detail.value || null;

    this.dispatchEvent(
      new CustomEvent("update", {
        detail: {
          value: this._value
        }
      })
    );
  }

  handleFocus() {
    this.dispatchEvent(new CustomEvent("focus"));
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
}
