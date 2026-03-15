import { classListMutation } from "c/utils";

import { LightningElement, api, track } from "lwc";

export const IS_ACTIVE_ATTRIBUTE = "is-active";
export const SLDS_SHOW = "slds-show";
export const SLDS_HIDE = "slds-hide";
export default class WizardStep extends LightningElement {
  @api hideNextButton = false;

  @api hidePreviousButton = false;
  @api label;
  @api name;
  @api validate = () => {
    return true;
  };

  @track _isActive = false;
  isFirst = false;

  isInit = false;
  isLast = false;

  labels = null;
  @api get isActive() {
    return this._isActive;
  }
  set isActive(value) {
    this.setActive(value);
  }

  get nextLabel() {
    return this.isLast ? this.labels.finish : this.labels.next;
  }

  get shouldHidePreviousButton() {
    return this.isFirst || this.hidePreviousButton;
  }

  config = (props) => {
    this.isFirst = props.isFirst;
    this.isLast = props.isLast;

    if (!this.isInit) {
      this.labels = props.labels;
      this.isInit = true;
    }
  };

  setActive = (value) => {
    this._isActive = value;

    if (value) {
      this.setAttribute(IS_ACTIVE_ATTRIBUTE, true);
      this.setAttribute("aria-hidden", false);
    } else {
      this.removeAttribute(IS_ACTIVE_ATTRIBUTE);
      this.setAttribute("aria-hidden", true);
    }

    classListMutation(this.classList, {
      [SLDS_SHOW]: value,
      [SLDS_HIDE]: !value
    });
  };

  nextStep() {
    this.dispatchEvent(new CustomEvent("next", { bubbles: true }));
  }

  previousStep() {
    this.dispatchEvent(new CustomEvent("previous", { bubbles: true }));
  }

  connectedCallback() {
    this.dispatchEvent(
      new CustomEvent("register", {
        bubbles: true,
        detail: {
          name: this.name,
          label: this.label,
          methods: {
            setActive: this.setActive,
            config: this.config,
            validate: this.validate
          }
        }
      })
    );
  }

  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("unregister", { bubbles: true, detail: this.name })
    );
  }
}
