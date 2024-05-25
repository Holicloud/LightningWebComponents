import { LightningElement, api } from "lwc";

export default class ExpandableSection extends LightningElement {
  @api nonCollapsible = false;
  @api title;

  @api
  get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(value) {
    this._isCollapsed = value;
  }

  _isCollapsed = false;

  get sectionClasses() {
    return `slds-section ${this.isExpanded ? "slds-is-open" : ""}`;
  }

  get isExpanded() {
    return this.nonCollapsible || !this._isCollapsed;
  }

  handleToggle() {
    this._isCollapsed = !this._isCollapsed;
  }
}
