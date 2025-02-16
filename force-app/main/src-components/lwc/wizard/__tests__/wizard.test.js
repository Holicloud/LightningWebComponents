import Wizard, { CURRENT_STEP_ATTRIBUTE, VARIANTS } from "c/wizard";
import WizardStep from "c/wizardStep";
import {
  ElementBuilder,
  flushPromises,
  getByDataId,
  removeChildren,
  createMockedEventListener
} from "test/utils";

const elementBuilder = new ElementBuilder("c-wizard", Wizard),
  wizardStepBuilder = new ElementBuilder("c-wizard-step", WizardStep);

describe("c-wizard", () => {
  let element;

  const getErrorMessage = () => getByDataId(element, "error-message"),
    getHeader = () => getByDataId(element, "header"),
    getProgressIndicator = () => getByDataId(element, "progress-indicator"),
    getStepSlot = () => element.shadowRoot.querySelector("slot:not([name])");

  async function testVariant(variant) {
    element.variant = variant;

    await flushPromises();

    const progressIndicator = getProgressIndicator();
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.type).toBe(VARIANTS[variant].type);
    expect(progressIndicator.variant).toBe(VARIANTS[variant].variant);
  }

  afterEach(() => {
    removeChildren();
  });

  it("should display progress indicator", async () => {
    element = await elementBuilder.build();
    const firstStep = { name: "first-step", label: "first step" },
      wizardSlot = getStepSlot(),
      stepBuilder = wizardStepBuilder.setConfig({ parentNode: wizardSlot });
    await stepBuilder.build(firstStep);
    await stepBuilder.build({ name: "second-step" });

    await flushPromises();

    const progressIndicator = getProgressIndicator();
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(firstStep.name);
    const steps = element.shadowRoot.querySelectorAll(
      "lightning-progress-step"
    );
    expect(steps.length).toBe(2);
    expect(steps[0].label).toBe(firstStep.label);
    expect(steps[0].value).toBe(firstStep.name);
    expect(element.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(firstStep.name);
    await expect(element).toBeAccessible();
  });

  it("test variants", async () => {
    element = await elementBuilder.build();

    for await (const variant of Object.keys(VARIANTS)) {
      await testVariant(variant);
    }

    expect(element).not.toBeNull();
    await expect(element).toBeAccessible();
  });

  it("displays header", async () => {
    element = await elementBuilder.build({ header: "sample header" });

    await flushPromises();

    expect(getHeader()?.textContent).toBe(element.header);
    await expect(element).toBeAccessible();
  });

  it("displays error messages when invalid", async () => {
    element = await elementBuilder.build();
    const errorMessage = "Something went wrong",
      wizardSlot = getStepSlot(),
      stepBuilder = wizardStepBuilder.setConfig({ parentNode: wizardSlot });
    await stepBuilder.build({
      name: "first-step",
      validate: () => {
        throw new Error(errorMessage);
      }
    });
    await stepBuilder.build({ name: "second-step" });

    await flushPromises();

    wizardSlot.dispatchEvent(new CustomEvent("next"));

    await flushPromises();
    expect(getErrorMessage()?.textContent).toBe("Error: " + errorMessage);

    await expect(element).toBeAccessible();
  });

  it("should navigate to next step", async () => {
    element = await elementBuilder.build();
    const firstStep = { name: "first-step" },
      secondStep = { name: "second-step" },
      wizardSlot = getStepSlot(),
      stepBuilder = wizardStepBuilder.setConfig({ parentNode: wizardSlot }),
      firstStepElement = await stepBuilder.build(firstStep),
      secondStepElement = await stepBuilder.build(secondStep),
      changeListener = createMockedEventListener(element, "change");

    await flushPromises();

    wizardSlot.dispatchEvent(new CustomEvent("next"));

    await flushPromises();

    const progressIndicator = getProgressIndicator();
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(secondStep.name);
    expect(element.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(secondStep.name);
    expect(changeListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { oldStep: firstStep.name, currentStep: secondStep.name }
      })
    );
    expect(firstStepElement.isActive).toBe(false);
    expect(secondStepElement.isActive).toBe(true);
    await expect(element).toBeAccessible();
  });

  it("should navigate to previous step", async () => {
    const secondStep = { name: "second-step" };
    element = await elementBuilder.build({ currentStep: secondStep.name });
    const firstStep = { name: "first-step" },
      wizardSlot = getStepSlot(),
      stepBuilder = wizardStepBuilder.setConfig({ parentNode: wizardSlot }),
      firstStepElement = await stepBuilder.build(firstStep),
      secondStepElement = await stepBuilder.build(secondStep),
      changeListener = createMockedEventListener(element, "change");

    await flushPromises();

    wizardSlot.dispatchEvent(new CustomEvent("previous"));

    await flushPromises();

    const progressIndicator = getProgressIndicator();
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(firstStep.name);
    expect(element.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(firstStep.name);
    expect(changeListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { oldStep: secondStep.name, currentStep: firstStep.name }
      })
    );
    expect(firstStepElement.isActive).toBe(true);
    expect(secondStepElement.isActive).toBe(false);
    await expect(element).toBeAccessible();
  });

  it("should unregister step", async () => {
    element = await elementBuilder.build();
    const firstStep = { name: "first-step" },
      secondStep = { name: "second-step" },
      wizardSlot = getStepSlot(),
      stepBuilder = wizardStepBuilder.setConfig({ parentNode: wizardSlot }),
      firstStepElement = await stepBuilder.build(firstStep),
      secondStepElement = await stepBuilder.build(secondStep);

    await flushPromises();

    wizardSlot.removeChild(firstStepElement);
    wizardSlot.dispatchEvent(
      new CustomEvent("unregister", { detail: firstStep.name })
    );

    await flushPromises();

    const progressIndicator = getProgressIndicator();
    expect(progressIndicator).toBeDefined();
    expect(progressIndicator.currentStep).toBe(secondStep.name);
    expect(element.getAttribute(CURRENT_STEP_ATTRIBUTE)).toBe(secondStep.name);
    expect(secondStepElement.isActive).toBe(true);
    await expect(element).toBeAccessible();
  });
});
