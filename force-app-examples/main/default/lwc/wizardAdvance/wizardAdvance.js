import { LightningElement } from "lwc";
import LightningAlert from "lightning/alert";
import { validateStep } from "c/wizardStepBasic";

export default class WizardAdvance extends LightningElement {
  validateStep = (name) => {
    const step = [...this.template.querySelectorAll(`c-wizard-step`)].find(
      (stepElement) => stepElement.name === name
    );
    return validateStep(step);
  };

  async handleComplete() {
    await LightningAlert.open({
      message: "Success",
      theme: "success",
      label: "Welcome!"
    });
  }
}
