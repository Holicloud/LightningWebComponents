import { LightningElement, api } from "lwc";
import { classSet } from "c/utils";

export const VARIANTS = Object.freeze({
  error: {
    alertClass: "slds-alert_error",
    assistiveText: "error",
    iconName: "utility:error"
  },
  info: {
    alertClass: "slds-alert_info",
    assistiveText: "info",
    iconName: "utility:info"
  },
  offline: {
    alertClass: "slds-alert_offline",
    assistiveText: "offline",
    iconName: "utility:offline"
  },
  warning: {
    alertClass: "slds-alert_warning",
    assistiveText: "warning",
    iconName: "utility:warning"
  }
});

export default class Alert extends LightningElement {
  @api actionMessage;
  @api iconName;
  @api isNonCollapsible = false;
  @api variant = "info";

  _isHidden = false;

  @api
  get isHidden() {
    return this._isHidden;
  }
  set isHidden(value) {
    this.setAttribute("is-hidden", !!value);
    this._isHidden = !!value;
  }

  get alertClasses() {
    return classSet("slds-notify slds-notify_alert").add({
      [this.variantProps.alertClass]: !!this.variantProps.alertClass
    });
  }

  get closeButtonClasses() {
    return classSet("slds-button slds-button_icon slds-button_icon-small").add({
      "slds-button_icon-inverse": this.variant === "warning"
    });
  }

  get variantProps() {
    return VARIANTS[this.variant];
  }

  get icon() {
    return this.iconName || this.variantProps.iconName;
  }

  get closeButtonVariant() {
    return "bare" + (this.variant !== "warning" ? `-inverse` : "");
  }

  get isVisible() {
    return !this.isHidden;
  }

  hideAlert(event) {
    event.preventDefault();
    this._isHidden = true;
    this.dispatchEvent(new CustomEvent("collapsed"));
  }

  get isCollapsible() {
    return !this.isNonCollapsible;
  }

  handleAction(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent("action"));
  }
}
