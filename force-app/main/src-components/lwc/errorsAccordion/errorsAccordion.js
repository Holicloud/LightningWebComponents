import { LightningElement, api } from "lwc";

const LABELS = Object.freeze({
  error: "Error",
  buttons: {
    expandAll: "Expand All",
    collapseAll: "Collapse All"
  }
});

export default class ErrorsAccordion extends LightningElement {
  @api errors = [];
  @api isNonDismissable = false;
  @api title = LABELS.error;

  _isHidden = false;
  activeSections = [];
  LABELS = LABELS;

  @api
  get isHidden() {
    return this._isHidden;
  }
  set isHidden(value) {
    this.setAttribute("is-hidden", !!value);
    this._isHidden = !!value;
  }

  get displayCollapseAll() {
    return !!this.activeSections.length;
  }

  get displayExpandAll() {
    return this.activeSections.length !== Object.keys(this.errors).length;
  }

  get isCollapsible() {
    return !this.isNonDismissable;
  }

  get isVisible() {
    return !this.isHidden;
  }

  get sections() {
    return Object.entries(this.errors).map(([key, value]) => ({
      name: key,
      errors: value
    }));
  }

  expandAll() {
    this.activeSections = Object.keys(this.errors);
  }

  handleCollapseAll() {
    this.activeSections = [];
  }

  handleDismiss() {
    this._isHidden = true;
    this.dispatchEvent(new CustomEvent("dismiss"));
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
}
