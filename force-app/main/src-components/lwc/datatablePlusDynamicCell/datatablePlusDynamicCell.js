import { renderComponent } from "c/datatablePlusExtendedTypes";
import { LightningElement, api } from "lwc";

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
const DEFAULT_TYPE = "lightning/formattedText";

export default class DatatablePlusDynamicCell extends LightningElement {
  @api props = {};

  @api type = "lightning/formattedText";
  @api value;
  renderedComponent;

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
