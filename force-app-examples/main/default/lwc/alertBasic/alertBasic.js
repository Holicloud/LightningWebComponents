import { LightningElement } from "lwc";

export default class AlertBasic extends LightningElement {
  isHidden = false;
  handleAction() {
    console.log("do something such as naviagte somewhere");
    // navigate to somewhere
  }

  handleToggleVisibility() {
    this.isHidden = !this.isHidden;
  }
}
