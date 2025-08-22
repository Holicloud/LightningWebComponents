import { LightningElement, api } from "lwc";

const DEFAULT_TYPE = "lightning/formattedText";
const COMPONENTS = {
  "c/entry": () => import("c/entry"),
  "c/record": () => import("c/record"),
  "lightning/formattedDateTime": () => import("lightning/formattedDateTime"),
  "lightning/formattedEmail": () => import("lightning/formattedEmail"),
  "lightning/formattedNumber": () => import("lightning/formattedNumber"),
  "lightning/formattedText": () => import("lightning/formattedText"),
  "lightning/formattedTime": () => import("lightning/formattedTime"),
  "lightning/formattedUrl": () => import("lightning/formattedUrl")
};

export default class DatatablePlusDynamicCell extends LightningElement {
  _type = "lightning/formattedText";
  renderedComponent;

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  _value;
  @api props = {};

  @api
  get type() {
    return this._type;
  }
  set type(type) {
    if (!type) {
      type = DEFAULT_TYPE;
    }

    this.setType(type);
  }

  async setType(type) {
    if (typeof type === "function") {
      const value = await type();
      this.renderedComponent = value.default;
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

    if (
      !this.renderedComponent ||
      !(this.renderedComponent.prototype instanceof LightningElement)
    ) {
      const { default: ctor } = await import(DEFAULT_TYPE);
      this.renderedComponent = ctor;
    }
  }
}
