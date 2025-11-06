import { LightningElement, api } from "lwc";
import { classSet } from "c/utils";

const DEFAULT_VARIANT = "info";

export const VARIANTS = Object.freeze({
  info: {
    class: "slds-theme_info",
    assistiveText: "info",
    iconName: "utility:info",
    iconVariant: "inverse"
  },
  success: {
    class: "slds-theme_success",
    assistiveText: "success",
    iconName: "utility:success",
    iconVariant: "inverse"
  },
  warning: {
    class: "slds-theme_warning",
    assistiveText: "warning",
    iconName: "utility:warning",
    iconVariant: "inverse"
  },
  error: {
    class: "slds-theme_error",
    assistiveText: "error",
    iconName: "utility:error",
    iconVariant: "inverse"
  }
});

export default class ScopedNotification extends LightningElement {
  @api actionMessage;
  @api iconName;
  @api variant = DEFAULT_VARIANT;

  _isHidden = false;

  @api
  get isHidden() {
    return this._isHidden;
  }
  set isHidden(value) {
    this.setAttribute("is-hidden", !!value);
    this._isHidden = !!value;
  }

  get classes() {
    return classSet(
      "slds-scoped-notification slds-media slds-media_center"
    ).add({
      [this.variantProps.class]: !!this.variantProps.class
    });
  }

  get closeButtonClasses() {
    return classSet("slds-button slds-button_icon slds-button_icon-small").add({
      "slds-button_icon-inverse": this.variant === "warning"
    });
  }

  get variantProps() {
    return VARIANTS[this.variant] || VARIANTS[DEFAULT_VARIANT];
  }

  get icon() {
    return this.iconName || this.variantProps.iconName;
  }

  get isVisible() {
    return !this.isHidden;
  }

  handleAction(event) {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent("action"));
  }
}
