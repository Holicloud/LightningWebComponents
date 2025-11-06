import { LightningElement } from "lwc";

export default class ScopedNotificationBasic extends LightningElement {
  isHidden = false;
  handleAction() {
    // navigate to somewhere
  }

  handleToggleVisibility() {
    this.isHidden = !this.isHidden;
  }
}
