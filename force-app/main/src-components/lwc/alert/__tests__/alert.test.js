import Alert, { VARIANTS } from "c/alert";
import {
  createMockedEventListener,
  ElementBuilder,
  flushPromises,
  getByDataId,
  removeChildren
} from "test/utils";

const elementBuilder = new ElementBuilder("c-alert", Alert);

describe("c-alert", () => {
  let element;

  const getAlert = () => getByDataId(element, "alert"),
    getAction = () => getByDataId(element, "action"),
    getCloseButton = () => getByDataId(element, "close-button"),
    getIcon = () => getByDataId(element, "icon");

  afterEach(() => {
    removeChildren();
  });

  it("is not be visible when not required", async () => {
    element = await elementBuilder.build({
      isHidden: true
    });

    expect(getAlert()).toBeFalsy();

    element.isHidden = false;
    expect(getAlert()).toBeFalsy();

    expect(element).toBeAccessible();
  });

  it("sets alert clases", async () => {
    element = await elementBuilder.build();
    const alertClass = VARIANTS[element.variant].alertClass,
      closeButton = getCloseButton();

    expect(getAlert().classList).toContain(alertClass);
    expect(closeButton.classList).not.toContain("slds-button_icon-inverse");
    expect(closeButton.variant).toBe("bare-inverse");
  });

  it("sets icon from variants", async () => {
    element = await elementBuilder.build();
    const variantSettings = VARIANTS[element.variant];
    const icon = getIcon();
    expect(icon.iconName).toBe(variantSettings.iconName);
    expect(icon.variant).toBe(variantSettings.iconVariant);
  });

  it("overwrites icon", async () => {
    element = await elementBuilder.build({
      iconName: "utility:custom"
    });
    const icon = getIcon();
    expect(icon.iconName).toBe(element.iconName);
  });

  it("can setup an action", async () => {
    element = await elementBuilder.build({
      actionMessage: "some-action"
    });
    const actionMock = createMockedEventListener(element, "action");
    expect(getAction()?.textContent).toBe("some-action");
    getAction().click();
    expect(actionMock).toHaveBeenCalled();
  });

  it("cannot be collapsed", async () => {
    element = await elementBuilder.build({
      isNonCollapsible: true
    });

    expect(getCloseButton()).toBeFalsy();
  });

  it("is collapsed is dispatched when collapsed", async () => {
    element = await elementBuilder.build();
    const collapsedEventMock = createMockedEventListener(element, "collapsed");

    getCloseButton().click();

    await flushPromises();

    expect(getAlert()).toBeFalsy();
    expect(collapsedEventMock).toHaveBeenCalled();
  });

  it("close button is properly rendered when variant warning", async () => {
    element = await elementBuilder.build({
      variant: "warning"
    });

    const closeButton = getCloseButton();
    expect(closeButton.classList).toContain("slds-button_icon-inverse");
    expect(closeButton.variant).toBe("bare");
  });
});
