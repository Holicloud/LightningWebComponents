import ErrorsAccordion from "c/errorsAccordion";
import {
  removeChildren,
  ElementBuilder,
  getByDataId,
  flushPromises,
  getAllByDataId
} from "test/utils";
import ERRORS from "./data/errors.json";

const elementBuilder = new ElementBuilder(
  "c-errors-accordion",
  ErrorsAccordion
).setConfig({
  defaultApiProps: {
    errors: ERRORS
  }
});

describe("c-errors-accordion", () => {
  let element;

  const getCard = () => getByDataId(element, "card");
  const getTitle = () => getByDataId(element, "title");
  const getDismissButton = () => getByDataId(element, "dismiss");
  const getCollapseButton = () => getByDataId(element, "collapse-all");
  const getExpandButton = () => getByDataId(element, "expand-all");
  const getSections = () => [
    ...element.shadowRoot.querySelectorAll("lightning-accordion-section")
  ];
  const getAccordion = () =>
    element.shadowRoot.querySelector("lightning-accordion");
  const getErrors = () => getAllByDataId(element, "error");

  afterEach(() => {
    removeChildren();
  });

  it("should display title", async () => {
    element = await elementBuilder.build({
      title: "anything"
    });
    expect(getTitle().textContent).toBe(element.title);
  });

  it("should ge hidden", async () => {
    element = await elementBuilder.build({
      isHidden: true
    });
    expect(getCard()).toBeFalsy();
  });

  it("should get dismissed", async () => {
    element = await elementBuilder.build();
    getDismissButton().dispatchEvent(new CustomEvent("click"));
    await flushPromises();
    expect(getCard()).toBeFalsy();
  });

  it("should be hidden", async () => {
    element = await elementBuilder.build({
      isHidden: true
    });

    expect(getCard()).toBeFalsy();
  });

  it("should be non dismissable", async () => {
    element = await elementBuilder.build();

    expect(getDismissButton()).toBeTruthy();
    element.isNonDismissable = true;

    await flushPromises();
    expect(getDismissButton()).toBeFalsy();
  });

  it("should display errors", async () => {
    element = await elementBuilder.build();

    expect(getSections().length).toBe(Object.keys(ERRORS).length);
    expect(getAccordion().activeSectionName.length).toBe(
      Object.keys(ERRORS).length
    );
    expect(
      [...getSections()[0].querySelectorAll('[data-id="error"]')].length
    ).toBe(ERRORS.section1.length);
    expect(getErrors()[0].textContent).toBe(ERRORS.section1[0]);
  });

  it("should toggle active sections", async () => {
    element = await elementBuilder.build();

    expect(getAccordion().activeSectionName.length).toBe(
      Object.keys(ERRORS).length
    );

    getAccordion().dispatchEvent(
      new CustomEvent("sectiontoggle", {
        detail: {
          openSections: ["section1", "section2"]
        }
      })
    );

    await flushPromises();

    expect(getAccordion().activeSectionName.length).toBe(2);
  });

  it("should expand/collapse", async () => {
    element = await elementBuilder.build();

    expect(getAccordion().activeSectionName.length).toBe(
      Object.keys(ERRORS).length
    );

    getCollapseButton().dispatchEvent(new CustomEvent("click"));

    await flushPromises();

    expect(getAccordion().activeSectionName.length).toBe(0);

    getExpandButton().dispatchEvent(new CustomEvent("click"));

    expect(getAccordion()?.activeSectionName?.length).toBeFalsy();
  });
});
