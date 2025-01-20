import {
  ElementBuilder,
  resetDOM,
  assertElementIsAccesible,
  flushPromises,
  getByDataId
} from "test/utils";
import Lookup from "c/Lookup";
import OPTIONS from "./data/options.json";
import DEFAULT_OPTIONS from "./data/defaultOptions.json";
import { inputSearchTerm } from "./Lookup.utils.js";

describe("c-base-lookup exposed functions", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    Lookup
  ).setDefaultApiProperties({
    searchHandler: ({ getDefault }) => {
      return getDefault ? DEFAULT_OPTIONS : OPTIONS;
    },
    label: "Lookup Input"
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.useRealTimers();
  });

  it("sets all valid options from selected", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      isMultiEntry: true,
      value: OPTIONS.map((result) => result.id)
    });

    expect(element.value.length).toBe(OPTIONS.length);
    await assertElementIsAccesible(element);
  });

  it("should not set option when invalid", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      },
      value: "any"
    });

    expect(element.value).toBeUndefined();
    await assertElementIsAccesible(element);
  });

  it("renders valid options", async () => {
    // Create lookup
    const element = await elementBuilder.build();
    await flushPromises();

    // Query for rendered list items
    const listItemEls = element.shadowRoot.querySelectorAll(
      "[data-id='list-item']"
    );
    expect(listItemEls.length).toBe(DEFAULT_OPTIONS.length);
    const resultItemEls = listItemEls[0].querySelectorAll(
      "[data-id='subtitle']"
    );
    expect(resultItemEls.length).toBe(DEFAULT_OPTIONS[0].subtitles.length);
    await assertElementIsAccesible(element);
  });

  it("supports special regex characters in search term", async () => {
    const element = await elementBuilder.build();

    await inputSearchTerm(element, "[ab");

    const listItemEls = element.shadowRoot.querySelectorAll(
      "[data-id='list-item']"
    );
    expect(listItemEls?.length).toBe(OPTIONS.length);
    await assertElementIsAccesible(element);
  });

  it("focus the element", async () => {
    // Create lookup
    const element = await elementBuilder.build();
    element.focus();

    // Verify focus
    expect(document.activeElement).toEqual(element);
    await assertElementIsAccesible(element);
  });

  it("blurs removes focus and closes dropdown", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = await elementBuilder.build();

    // Simulate search term input (forces focus on lookup and opens drowdown)
    await inputSearchTerm(element, "sample");

    // Blur
    element.blur();
    await flushPromises();

    // Check that lookup no longer has focus and that dropdown is closed
    expect(document.activeElement).not.toBe(element);
    const dropdownEl = getByDataId(element, "dropdown");
    expect(dropdownEl.classList).not.toContain("slds-is-open");
    await assertElementIsAccesible(element);
  });

  it("reports valid by default", async () => {
    // Create lookup
    const element = await elementBuilder.build();

    // Verify validity
    expect(element.validity).toEqual({ valid: true });
    await assertElementIsAccesible(element);
  });

  it("reports non valid when there are errors", async () => {
    // Create lookup
    const element = await elementBuilder.build();
    element.setCustomValidity("Some error");

    // Verify validity
    expect(element.validity).toEqual({ valid: false });
    await assertElementIsAccesible(element);
  });
});
