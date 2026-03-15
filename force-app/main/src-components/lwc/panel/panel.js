import { classSet, isNotBlank } from "c/utils";

import { LightningElement, api } from "lwc";

export const LABELS = {
  reviewYourInputs: "Review your inputs"
};

export default class Panel extends LightningElement {
  @api classes;
  @api icon = "utility:user";
  @api title;

  @api checkValidity() {
    return this.reportValidity();
  }

  @api reportValidity() {
    this.showError = false;

    const valid = [...this.querySelectorAll("[data-input]")].reduce(
      (validSoFar, inputCmp) => {
        inputCmp.reportValidity();
        return validSoFar && inputCmp.checkValidity();
      },
      true
    );

    if (!valid) {
      this.areInputsInvalid = true;
      this.showError = true;
      return false;
    }

    if (this.areInputsInvalid) {
      this.areInputsInvalid = false;
    }

    if (isNotBlank(this.errorMessage)) {
      this.showError = true;
      return false;
    }

    return true;
  }

  @api setCustomValidity(errorMessage, field) {
    if (field) {
      this.querySelector(`[data-input="${field}"]`)?.setCustomValidity(
        errorMessage
      );
    }

    this.errorMessage = errorMessage;
  }

  areInputsInvalid = false;
  errorMessage = "";
  showError = false;

  get cardClass() {
    return classSet("slds-card")
      .add("default-background")
      .add(this.classes)
      .add({
        "slds-card_boundary has-error": this.displayError
      })
      .toString();
  }

  get displayError() {
    return this.message && this.showError;
  }

  get message() {
    return this.areInputsInvalid ? LABELS.reviewYourInputs : this.errorMessage;
  }
}
