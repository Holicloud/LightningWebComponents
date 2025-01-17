import { createElement } from "lwc";
import Wizard, { CURRENT_STEP_ATTRIBUTE, VARIANTS } from "c/wizard";
import WizardStep from "c/wizardStep";
import { setImmediate } from "timers";

describe("c-wizard", () => {
  async function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
  }

  function createWizard(props = {}) {
    const element = createElement("c-wizard", {
      is: Wizard
    });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
  }

  function getStepSlot(wizard) {
    return wizard.shadowRoot.querySelector("slot:not([name])");
  }

  function createWizardStep(wizard, props = {}) {
    const element = createElement("c-wizard-step", {
      is: WizardStep
    });
    Object.assign(element, props);

    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation((message) => {
        if (!message.includes('`lwc:dom="manual"` directive.')) {
          console.warn(message);
        }
      });

    getStepSlot(wizard).appendChild(element);

    consoleWarnSpy.mockRestore();
    return element;
  }

  function getByDataId(element, dataId) {
    return element.shadowRoot.querySelector(`[data-id="${dataId}"]`);
  }

  async function testVariant(wizard, variant) {
    wizard.variant = variant;

    await flushPromises();

    let progressIndicator = getByDataId(wizard, "progress-indicator");
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.type).toBe(VARIANTS[variant].type);
    expect(progressIndicator.variant).toBe(VARIANTS[variant].variant);
  }

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should display progress indicator", async () => {
    const wizard = createWizard();
    const firstStep = { name: "first-step", label: "first step" };
    createWizardStep(wizard, firstStep);
    createWizardStep(wizard, { name: "second-step" });

    await flushPromises();

    const progressIndicator = getByDataId(wizard, "progress-indicator");
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(firstStep.name);
    const steps = wizard.shadowRoot.querySelectorAll("lightning-progress-step");
    expect(steps.length).toBe(2);
    expect(steps[0].label).toBe(firstStep.label);
    expect(steps[0].value).toBe(firstStep.name);
    expect(wizard.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(firstStep.name);
    await expect(wizard).toBeAccessible();
  });

  it("test variants", async () => {
    const wizard = createWizard();

    for await (const variant of Object.keys(VARIANTS)) {
      await testVariant(wizard, variant);
    }

    await expect(wizard).toBeAccessible();
  });

  it("displays header", async () => {
    const wizardProps = { header: "sample header" };
    const wizard = createWizard(wizardProps);

    await flushPromises();

    expect(getByDataId(wizard, "header")?.textContent).toBe(wizardProps.header);
    await expect(wizard).toBeAccessible();
  });

  it("displays error messages when invalid", async () => {
    const wizard = createWizard();
    const errorMessage = "Something went wrong";
    createWizardStep(wizard, {
      name: "first-step",
      validate: () => {
        throw new Error(errorMessage);
      }
    });
    createWizardStep(wizard, { name: "second-step" });

    await flushPromises();

    getStepSlot(wizard).dispatchEvent(new CustomEvent("next"));

    await flushPromises();
    expect(getByDataId(wizard, "error-message")?.textContent).toBe(
      "Error: " + errorMessage
    );

    await expect(wizard).toBeAccessible();
  });

  it("should navigate to next step", async () => {
    const wizard = createWizard();
    const firstStep = { name: "first-step" };
    const secondStep = { name: "second-step" };
    const firstStepElement = createWizardStep(wizard, { name: "first-step" });
    const secondStepElement = createWizardStep(wizard, secondStep);
    const dispatchEventSpy = jest.spyOn(wizard, "dispatchEvent");

    await flushPromises();

    getStepSlot(wizard).dispatchEvent(new CustomEvent("next"));

    await flushPromises();

    const progressIndicator = getByDataId(wizard, "progress-indicator");
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(secondStep.name);
    expect(wizard.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(secondStep.name);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "change",
        detail: { oldStep: firstStep.name, currentStep: secondStep.name }
      })
    );
    expect(firstStepElement.isActive).toBe(false);
    expect(secondStepElement.isActive).toBe(true);
    await expect(wizard).toBeAccessible();
  });

  it("should navigate to previous step", async () => {
    const wizard = createWizard({ currentStep: "second-step" });
    const firstStep = { name: "first-step" };
    const secondStep = { name: "second-step" };
    const firstStepElement = createWizardStep(wizard, { name: "first-step" });
    const secondStepElement = createWizardStep(wizard, secondStep);
    const dispatchEventSpy = jest.spyOn(wizard, "dispatchEvent");

    await flushPromises();

    getStepSlot(wizard).dispatchEvent(new CustomEvent("previous"));

    await flushPromises();

    const progressIndicator = getByDataId(wizard, "progress-indicator");
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(firstStep.name);
    expect(wizard.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(firstStep.name);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "change",
        detail: { oldStep: secondStep.name, currentStep: firstStep.name }
      })
    );
    expect(firstStepElement.isActive).toBe(true);
    expect(secondStepElement.isActive).toBe(false);
    await expect(wizard).toBeAccessible();
  });

  it("should unregister step", async () => {
    const wizard = createWizard();
    const firstStep = { name: "first-step" };
    const secondStep = { name: "second-step" };
    const firstStepElement = createWizardStep(wizard, firstStep);
    const secondStepElement = createWizardStep(wizard, secondStep);

    await flushPromises();

    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation((message) => {
        if (!message.includes('`lwc:dom="manual"` directive.')) {
          console.warn(message);
        }
      });
    getStepSlot(wizard).removeChild(firstStepElement);
    consoleWarnSpy.mockRestore();
    getStepSlot(wizard).dispatchEvent(
      new CustomEvent("unregister", { detail: firstStep.name })
    );

    await flushPromises();

    const progressIndicator = getByDataId(wizard, "progress-indicator");
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(secondStep.name);
    expect(wizard.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(secondStep.name);
    expect(secondStepElement.isActive).toBe(true);
    await expect(wizard).toBeAccessible();
  });
});
