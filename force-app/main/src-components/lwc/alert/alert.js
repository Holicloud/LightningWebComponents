import { LightningElement, api } from "lwc";
export const VARIANTS = Object.freeze({
  info: {
    assistiveText: "info",
    icon: "utility:info",
    iconVariant: "inverse"
  },
  warning: {
    assistiveText: "warning",
    icon: "utility:warning",
    alertClass: "slds-alert_warning"
  },
  error: {
    assistiveText: "error",
    icon: "utility:error",
    alertClass: "slds-alert_error",
    iconVariant: "inverse"
  },
  offline: {
    assistiveText: "offline",
    icon: "utility:offline",
    alertClass: "slds-alert_offline",
    iconVariant: "inverse"
  }
});

export default class Alert extends LightningElement {
  @api variant = "info";
  @api iconName;
  @api actionMessage;
  @api nonCollapsible = false;

  @api
  get visible() {
    return this.visible;
  }
  set visible(value) {
    this._visible = value;
  }

  _visible = true;

  get alertClasses() {
    return "slds-notify slds-notify_alert " + this.variantProps.alertClass || "";
  }

  get closeButtonClasses() {
    return "slds-button slds-button_icon slds-button_icon-small" + this.variant === "warning"
      ? " slds-button_icon-inverse"
      : "";
  }

  get variantProps() {
    return VARIANTS[this.variant];
  }

  get icon() {
    return this.iconName || this.variantProps.icon;
  }

  get iconVariant() {
    return this.variantProps.iconVariant;
  }

  get closeButtonVariant() {
    return "bare" + (this.iconVariant ? `-${this.iconVariant}` : "");
  }

  hideAlert() {
    this._visible = false;
  }

  get isCollapsible() {
    return !this.nonCollapsible;
  }

  handleAction(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent("action"));
  }
}
