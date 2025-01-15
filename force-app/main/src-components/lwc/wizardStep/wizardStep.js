import { LightningElement, api, track } from "lwc";

export const IS_ACTIVE_ATTRIBUTE = 'is-active';
export const SLDS_SHOW = 'slds-show';
export const SLDS_HIDE = 'slds-hide';
export default class WizardStep extends LightningElement {
  @api name;
  @api label;
  @api validate = () => {
    return true;
  };
  @api hidePreviousButton = false;
  @api hideNextButton = false;

  @track _isActive = false;
  @api get isActive() {
    return this._isActive;
  }
  set isActive(value) {
    this.setActive(value);
  }

  labels = null;
  isInit = false;
  isLast = false;
  isFirst = false;

  get shouldHidePreviousButton() {
    return this.isFirst || this.hidePreviousButton;
  }

  get nextLabel() {
    return this.isLast ? this.labels.finish : this.labels.next;
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
    this.dispatchEvent(new CustomEvent("unregister", { bubbles: true, detail: this.name }));
  }

  setActive = (value) => {
    this._isActive = value;

    if (value) {
      this.setAttribute(IS_ACTIVE_ATTRIBUTE, true);
      this.setAttribute("aria-hidden", false);
      this.classList.add(SLDS_SHOW);
      this.classList.remove(SLDS_HIDE);
    } else {
      this.removeAttribute(IS_ACTIVE_ATTRIBUTE);
      this.setAttribute("aria-hidden", true);
      this.classList.remove(SLDS_SHOW);
      this.classList.add(SLDS_HIDE);
    }
  }

  config = (props) => {
    this.isFirst = props.isFirst;
    this.isLast = props.isLast;

    if (!this.isInit) {
      this.labels = props.labels;
      this.isInit = true;
    }
  }

  nextStep() {
    this.dispatchEvent(new CustomEvent("next", { bubbles: true }));
  }

  previousStep() {
    this.dispatchEvent(new CustomEvent("previous", { bubbles: true }));
  }
}
