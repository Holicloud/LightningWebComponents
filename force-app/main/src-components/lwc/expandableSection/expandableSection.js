import { LightningElement, api } from "lwc";
import { classSet } from "c/utils";

export default class ExpandableSection extends LightningElement {
  @api nonCollapsible = false;
  @api title;

  _isCollapsed = false;

  @api
  get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(value) {
    this._isCollapsed = value;
  }

  get sectionClasses() {
    return classSet("slds-section")
      .add({ "slds-is-open": this.isExpanded })
      .toString();
  }

  get isExpanded() {
    return this.nonCollapsible || !this.isCollapsed;
  }

  handleToggle() {
    this._isCollapsed = !this.isCollapsed;
  }
}
