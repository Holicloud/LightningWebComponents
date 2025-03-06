import { LightningElement, api } from "lwc";

const LABELS = Object.freeze({
  error: "Error",
  buttons: {
    expandAll: "Expand All",
    collapseAll: "Collapse All"
  }
});

export default class ErrorsAccordion extends LightningElement {
  @api title = LABELS.error;
  @api isNonDismissable = false;
  @api errors = [];

  LABELS = LABELS;
  _isHidden = false;
  activeSections = [];

  @api
  get isHidden() {
    return this._isHidden;
  }
  set isHidden(value) {
    this.setAttribute("is-hidden", !!value);
    this._isHidden = !!value;
  }

  get isVisible() {
    return !this.isHidden;
  }

  get isCollapsible() {
    return !this.isNonDismissable;
  }

  get displayCollapseAll() {
    return !!this.activeSections.length;
  }

  get displayExpandAll() {
    return this.activeSections.length !== Object.keys(this.errors).length;
  }

  handleCollapseAll() {
    this.activeSections = [];
  }

  handleExpandAll() {
    this.expandAll();
  }

  handleToggleSection(event) {
    this.activeSections = event.detail.openSections;
  }

  connectedCallback() {
    this.expandAll();
  }

  handleDismiss() {
    this._isHidden = true;
    this.dispatchEvent(new CustomEvent("dismiss"));
  }

  expandAll() {
    this.activeSections = Object.keys(this.errors);
  }

  get sections() {
    return Object.entries(this.errors).map(([key, value]) => ({
      name: key,
      errors: value
    }));
  }
}
