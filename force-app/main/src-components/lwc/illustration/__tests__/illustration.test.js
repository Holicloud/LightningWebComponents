import Illustration, { SIZES, TEMPLATE_BY_VARIANT } from "c/illustration";
import { ElementBuilder, removeChildren, flushPromises } from "test/utils";

const elementBuilder = new ElementBuilder("c-illustration", Illustration),
  VARIANTS = Object.keys(TEMPLATE_BY_VARIANT);

describe("c-illustration", () => {
  let element;

  const getIllustration = () =>
    element.shadowRoot.querySelector(".slds-illustration");
  const getTitle = () =>
    element.shadowRoot.querySelector(".slds-text-heading_medium");
  const getSvg = () =>
    element.shadowRoot.querySelector(".slds-illustration__svg");
  const getPrimaryColors = () => [
    ...element.shadowRoot.querySelectorAll(".slds-illustration__fill-primary")
  ];
  const getSecondaryColors = () => [
    ...element.shadowRoot.querySelectorAll(".slds-illustration__fill-secondary")
  ];
  const getPrimaryStrokes = () => [
    ...element.shadowRoot.querySelectorAll(".slds-illustration__stroke-primary")
  ];
  const getSecondaryStrokes = () => [
    ...element.shadowRoot.querySelectorAll(
      ".slds-illustration__stroke-secondary"
    )
  ];

  afterEach(() => {
    removeChildren();
  });

  it.each(VARIANTS)("should change size of illustration", async () => {
    element = await elementBuilder.build();

    expect(getIllustration().classList).not.toContain(
      "slds-illustration_small"
    );
    expect(getIllustration().classList).not.toContain(
      "slds-illustration_large"
    );
    expect(getTitle()).toBeFalsy();

    element.size = SIZES.SMALL;
    await flushPromises();

    expect(getIllustration().classList).toContain("slds-illustration_small");
    expect(getIllustration().classList).not.toContain(
      "slds-illustration_large"
    );

    element.size = SIZES.LARGE;
    element.title = "Test title";
    await flushPromises();

    expect(getIllustration().classList).not.toContain(
      "slds-illustration_small"
    );
    expect(getIllustration().classList).toContain("slds-illustration_large");
    expect(getTitle().classList).toContain("slds-illustration__header");
    expect(getTitle().textContent).toContain(element.title);

    await expect(element).toBeAccessible();
  });

  it.each(VARIANTS)("should hide illustration", async () => {
    element = await elementBuilder.build({
      hideIllustration: true
    });

    expect(getSvg().classList).toContain("slds-hide");

    await expect(element).toBeAccessible();
  });

  it.each(VARIANTS)("should set colors", async () => {
    element = await elementBuilder.build({
      hideIllustration: true,
      primaryColor: "red",
      secondaryColor: "blue",
      primaryStroke: "black",
      secondaryStroke: "white"
    });

    getPrimaryColors().forEach((item) => {
      expect(item.style.fill).toBe(element.primaryColor);
    });
    getSecondaryColors().forEach((item) => {
      expect(item.style.fill).toBe(element.secondaryColor);
    });
    getPrimaryStrokes().forEach((item) => {
      expect(item.style.stroke).toBe(element.primaryStroke);
    });
    getSecondaryStrokes().forEach((item) => {
      expect(item.style.stroke).toBe(element.secondaryStroke);
    });

    await expect(element).toBeAccessible();
  });
});
