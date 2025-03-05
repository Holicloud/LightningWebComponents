import { LightningElement, api } from "lwc";
import { classSet } from "c/utils";

export const INVERSE_VARIANT = "inverse";

export default class ComponentExample extends LightningElement {
  @api title;
  @api variant;

  get bodyClasses() {
    return classSet("slds-p-around_medium")
      .add({ "lgc-bg": this.variant !== INVERSE_VARIANT })
      .add({ "lgc-bg-inverse": this.variant === INVERSE_VARIANT })
      .toString();
  }
}
