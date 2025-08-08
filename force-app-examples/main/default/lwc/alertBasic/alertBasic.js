import { LightningElement } from "lwc";

export default class AlertBasic extends LightningElement {
  isHidden = false;
  handleAction() {
    // navigate to somewhere
  }

  handleToggleVisibility() {
    this.isHidden = !this.isHidden;
  }
}
