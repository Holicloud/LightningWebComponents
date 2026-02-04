import { LightningElement, api } from "lwc";
import { renderComponent } from "c/datatablePlusExtendedTypes";

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
