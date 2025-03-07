import Panel, { LABELS } from "c/panel";
import {
  ElementBuilder,
  getByDataId,
  removeChildren,
  flushPromises
} from "test/utils";
import LightningInput from "lightning/input";

const elementBuilder = new ElementBuilder("c-expandable-section", Panel);

const lightningInputBuilder = new ElementBuilder(
  "lightning-input",
  LightningInput
).setConfig({
  defaultApiProps: {
    reportValidity: jest.fn(),
    checkValidity: () => true
  }
});

describe("c-dependent", () => {
  let element;

  const getTitle = () => getByDataId(element, "title");
  const getCard = () => getByDataId(element, "card");
  const getIcon = () => getByDataId(element, "icon");
  const getErrorMessage = () => getByDataId(element, "error-message");
  const getDefaultSlot = () =>
    element.shadowRoot.querySelector("slot:not([name])");

  afterEach(() => {
    removeChildren();
  });

  it("should display title and icon", async () => {
    element = await elementBuilder.build({
      title: "Title",
      icon: "some:icon"
    });

    expect(getTitle().textContent).toBe(element.title);
    expect(getIcon().iconName).toBe(element.icon);
  });

  it("should display error message when there are inputs invalid inside the component and reportValidity is ran", async () => {
    element = await elementBuilder.build();

    const inputElement = await lightningInputBuilder
      .setConfig({ parentNode: getDefaultSlot() })
      .build({
        checkValidity: () => false
      });

    inputElement.setAttribute("data-input", "input");

    element.reportValidity();
    await flushPromises();
    expect(Array.from(getCard().classList)).toEqual(
      expect.arrayContaining(["slds-card_boundary", "has-error"])
    );
    expect(getErrorMessage().textContent).toBe(LABELS.reviewYourInputs);

    inputElement.checkValidity = () => true;
    element.reportValidity();
    await flushPromises();
    expect(Array.from(getCard().classList)).not.toEqual(
      expect.arrayContaining(["slds-card_boundary", "has-error"])
    );
    expect(getErrorMessage()).toBeFalsy();
  });

  it("should display error message when validatiy is set", async () => {
    const customError = "Custom Error";
    element = await elementBuilder.build();

    element.setCustomValidity(customError);
    element.reportValidity();
    await flushPromises();

    expect(Array.from(getCard().classList)).toEqual(
      expect.arrayContaining(["slds-card_boundary", "has-error"])
    );
    expect(getErrorMessage().textContent).toBe(customError);

    element.setCustomValidity("");
    element.reportValidity();
    await flushPromises();

    expect(Array.from(getCard().classList)).not.toEqual(
      expect.arrayContaining(["slds-card_boundary", "has-error"])
    );
    expect(getErrorMessage()).toBeFalsy();
  });

  it("should display error message on field when there are inputs invalid inside the component and reportValidity is ran", async () => {
    element = await elementBuilder.build();
    const inputDataId = "name";
    const errorMessage = "Error Message";
    const inputElement = await lightningInputBuilder
      .setConfig({ parentNode: getDefaultSlot() })
      .build({
        setCustomValidity: jest.fn()
      });

    inputElement.setAttribute("data-input", inputDataId);

    element.setCustomValidity(errorMessage, inputDataId);
    element.reportValidity();

    await flushPromises();
    expect(inputElement.setCustomValidity).toHaveBeenCalledWith(errorMessage);
    expect(Array.from(getCard().classList)).toEqual(
      expect.arrayContaining(["slds-card_boundary", "has-error"])
    );
    expect(getErrorMessage().textContent).toBe(errorMessage);

    element.setCustomValidity("", inputDataId);
    element.reportValidity();
    await flushPromises();
    expect(Array.from(getCard().classList)).not.toEqual(
      expect.arrayContaining(["slds-card_boundary", "has-error"])
    );
    expect(getErrorMessage()).toBeFalsy();
  });
});
