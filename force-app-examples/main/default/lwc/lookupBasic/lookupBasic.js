import { LightningElement } from "lwc";

export default class LookupBasic extends LightningElement {
  actions = [
    {
      label: "Account",
      name: "add_account"
    },
    {
      label: "New Opportunity",
      name: "add_opportunity",
      icon: {
        iconName: "standard:opportunity"
      }
    }
  ];

  actionClicked = "";

  handleAction(event) {
    this.actionClicked = event.detail;
  }
}
