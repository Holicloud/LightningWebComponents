import { LightningElement } from "lwc";
import LightningConfirm from "lightning/confirm";

const validateStep = (step) => {
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

export default class WizardStepBasic extends LightningElement {
  async navigateToNextStep() {
    const shouldNavigateTo = await LightningConfirm.open({
      message: "Want to Go to the Next step?",
      variant: "headerless",
      label: "Want to Go Next?"
    });

    if (shouldNavigateTo) {
      this.refs.firstWizard.currentStep = "step-2";
    }
  }

  validateStep = (name) => {
    const step = [...this.template.querySelectorAll(`c-wizard-step`)].find(
      (stepElement) => stepElement.name === name
    );
    return validateStep(step);
  };
}

export { validateStep };
