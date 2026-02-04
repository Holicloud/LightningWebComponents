import ScopedNotification, { VARIANTS } from "c/scopedNotification";
import {
  createMockedEventListener,
  ElementBuilder,
  getByDataId,
  removeChildren,
  flushPromises
} from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-scoped-notification",
  ScopedNotification
);

describe("c-scoped-notification", () => {
  let element;

  const getScopedNotification = () =>
    getByDataId(element, "scoped-notification");
  const getAction = () => getByDataId(element, "action");
  const getIcon = () => getByDataId(element, "icon");

  afterEach(() => {
    removeChildren();
  });

  it("is not be visible when not required", async () => {
    element = await elementBuilder.build({
      isHidden: true
    });

    expect(getScopedNotification()).toBeFalsy();

    element.isHidden = false;

    await flushPromises();

    expect(getScopedNotification()).toBeTruthy();

    expect(element).toBeAccessible();
  });

  it("sets alert clases", async () => {
    element = await elementBuilder.build();
    const expected = VARIANTS[element.variant].class;

    expect(getScopedNotification().classList).toContain(expected);
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
      iconName: "some:icon"
    });
    const icon = getIcon();
    expect(icon.iconName).toBe(element.iconName);
  });

  it("can setup an action", async () => {
    element = await elementBuilder.build({
      actionMessage: "message"
    });
    const actionMock = createMockedEventListener(element, "action");
    expect(getAction()?.textContent).toBe("message");
    getAction().click();
    expect(actionMock).toHaveBeenCalled();
  });
});
