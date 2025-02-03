import { LightningElement } from "lwc";
import LightningAlert from "lightning/alert";

export default class WizardAdvance extends LightningElement {
  validateStep = (name) => {
    const step = [...this.template.querySelectorAll(`c-wizard-step`)].find(
      (stepElement) => stepElement.name === name
    );
    const isValid = [...step.querySelectorAll("lightning-input")].reduce(
      (isValidSoFar, input) => {
        input.reportValidity();
        return isValidSoFar && input.checkValidity();
      },
      true
    );

    if (!isValid) {
      throw new Error("fill your input and try again");
    }

    return isValid;
  };

  async handleComplete() {
    await LightningAlert.open({
      message: "Success",
      theme: "success",
      label: "Welcome!"
    });
  }
}
