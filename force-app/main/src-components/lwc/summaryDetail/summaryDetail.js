import { classSet } from "c/utils";
import { LightningElement, api } from "lwc";

export default class SummaryDetail extends LightningElement {
  @api isNonCollapsible = false;
  @api title;
  _isCollapsed = false;

  @api
  get isCollapsed() {
    return this._isCollapsed;
  }

  set isCollapsed(value) {
    this._isCollapsed = value;
  }

  get isCollapsible() {
    return !this.isNonCollapsible;
  }

  get isExpanded() {
    return this.isNonCollapsible || !this.isCollapsed;
  }

  get summaryClasses() {
    return classSet("slds-summary-detail")
      .add({ "slds-is-open": this.isExpanded })
      .toString();
  }

  handleToggle() {
    this._isCollapsed = !this.isCollapsed;
  }
}
