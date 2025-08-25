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
  renderedComponent;

  @api value;
  @api props = {};
  @api type = "lightning/formattedText";

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

  connectedCallback() {
    this.setType();
  }
}
