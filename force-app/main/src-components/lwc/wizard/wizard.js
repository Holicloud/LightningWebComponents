import { LightningElement, api, track } from "lwc";

export const VARIANTS = Object.freeze({
  "base-shade": { variant: "shade", type: "base" },
  path: { variant: "base", type: "path" },
  base: { variant: "base", type: "base" }
});

export const CURRENT_STEP_ATTRIBUTE = "current-step";

export default class Wizard extends LightningElement {
  @api finishLabel = "Finish";
  @api header = "";

  @api nextLabel = "Next";
  @api previousLabel = "Previous";
  @api variant = "base";

  @api
  get currentStep() {
    return this._currentStep;
  }

  set currentStep(value) {
    this.setCurrentStep(value);
  }

  @track flow = [];

  @track steps = {};
  _currentStep = null;
  errorMessage = null;

  hasError = false;

  hasRender = false;

  labels = {
    error: "Error"
  };

  get variantProps() {
    return VARIANTS[this.variant] || VARIANTS.base;
  }

  configSteps() {
    const stepComponents = [...this.querySelectorAll("c-wizard-step")];

    this.flow = stepComponents.reduce((acc, step, index) => {
      const actualStep = this.steps[step.name];
      if (actualStep) {
        actualStep.methods.config({
          isFirst: index === 0,
          isLast: index === stepComponents.length - 1
        });
        acc.push(actualStep);
      }
      return acc;
    }, []);

    if (!this._currentStep && this.flow?.length) {
      this.setActiveStep(this.flow[0].name);
    }
  }

  dispatchChange(stepName) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          oldStep: this._currentStep,
          currentStep: stepName
        }
      })
    );
  }

  async handleNext(event) {
    event.stopPropagation();
    event.preventDefault();
    const currentStep = this.steps[this._currentStep],
      currentStepIndex = this.flow.indexOf(currentStep);
    this.hasError = !(await this.validateStep(currentStep));

    if (!this.hasError) {
      const newStep = this.flow[currentStepIndex + 1];

      if (newStep) {
        this.dispatchChange(newStep.name);
        this.setActiveStep(newStep.name);
      } else {
        this.dispatchEvent(new CustomEvent("complete"));
      }
    }
  }

  async handlePrevious(event) {
    event.stopPropagation();
    event.preventDefault();
    const currentStepIndex = this.flow.indexOf(this.steps[this._currentStep]),
      newStep = this.flow[currentStepIndex - 1];

    if (newStep) {
      this.hasError = false;
      this.dispatchChange(newStep.name);
      this.setActiveStep(newStep.name);
    }
  }

  handleRegister(event) {
    event.stopPropagation();
    event.preventDefault();
    const step = event.detail;
    this.steps[step.name] = step;
    step.methods.config({
      labels: {
        next: this.nextLabel,
        previous: this.previousLabel,
        finish: this.finishLabel
      }
    });
  }

  handleSlotChange() {
    this.configSteps();
    this.setActiveStep();
  }

  handleUnregister(event) {
    event.stopPropagation();
    event.preventDefault();
    delete this.steps[event.detail];
    if (event.detail === this._currentStep) {
      this._currentStep = null;
    }
    this.handleSlotChange();
  }

  setActiveStep(stepName) {
    if (stepName) {
      this.setAttribute(CURRENT_STEP_ATTRIBUTE, stepName);
      this._currentStep = stepName;
    }

    if (Object.values(this.steps).length) {
      Object.values(this.steps).forEach((step) =>
        step.methods.setActive(step.name === this._currentStep)
      );
    }
  }

  setCurrentStep(value) {
    this.setAttribute(CURRENT_STEP_ATTRIBUTE, value);
    this._currentStep = value;

    if (this.hasRender) {
      this.dispatchChange(value);
      this.setActiveStep(value);
    }
  }

  validateStep(step) {
    return new Promise((resolve) => {
      try {
        if (!step.methods.validate) {
          return resolve(true);
        }

        return resolve(step.methods.validate(step.name));
      } catch (error) {
        this.errorMessage = error;
        return resolve(false);
      }
    });
  }

  renderedCallback() {
    if (!this.hasRender) {
      this.hasRender = true;
      this.configSteps();
      this.setActiveStep();
    }
  }
}
