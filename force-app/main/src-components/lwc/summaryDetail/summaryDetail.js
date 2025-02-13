import { LightningElement, api } from "lwc";
import { classSet } from "c/utils";

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

  get summaryClasses() {
    return classSet("slds-summary-detail")
      .add({ "slds-is-open": this.isExpanded })
      .toString();
  }

  get isExpanded() {
    return this.isNonCollapsible || !this.isCollapsed;
  }

  get isCollapsible() {
    return !this.isNonCollapsible;
  }

  handleToggle() {
    this._isCollapsed = !this.isCollapsed;
  }
}
