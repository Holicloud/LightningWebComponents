import { classSet } from "c/utils";
import { LightningElement, api } from "lwc";

export default class ExpandableSection extends LightningElement {
  @api isNonCollapsible = false;
  @api title;

  @api
  get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(value) {
    this._isCollapsed = value;
  }

  _isCollapsed = false;

  get isExpanded() {
    return this.isNonCollapsible || !this.isCollapsed;
  }

  get sectionClasses() {
    return classSet("slds-section")
      .add({ "slds-is-open": this.isExpanded })
      .toString();
  }

  handleToggle() {
    this._isCollapsed = !this.isCollapsed;
  }
}
