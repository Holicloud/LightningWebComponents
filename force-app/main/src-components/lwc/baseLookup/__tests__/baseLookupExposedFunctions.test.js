import {
  ElementBuilder,
  resetDOM,
  assertElementIsAccesible,
  flushPromises,
  getByDataId
} from "test/utils";
import BaseLookup from "c/baseLookup";
import OPTIONS from "./data/options.json";
import DEFAULT_OPTIONS from "./data/defaultOptions.json";
import { inputSearchTerm } from "./baseLookup.utils.js";

describe("c-base-lookup exposed functions", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    BaseLookup
  ).setDefaultApiProperties({
    options: OPTIONS,
    label: "Lookup Input"
  });

  afterEach(() => {
    resetDOM();
  });

  it("sets all valid options from selected", async () => {
    // Create lookup
    const element = elementBuilder.build({
      isMultiEntry: true,
      value: OPTIONS.map((result) => result.id)
    });

    expect(element.value.length).toBe(OPTIONS.length);
    await assertElementIsAccesible(element);
  });

  it("should not set option when invalid", async () => {
    // Create lookup
    const element = elementBuilder.build({
      options: [],
      defaultOptions: [],
      value: "any"
    });

    expect(element.value).toBeUndefined();
    await assertElementIsAccesible(element);
  });

  it("setSearchResults renders correct results", async () => {
    // Create lookup
    const element = elementBuilder.build({
      defaultOptions: DEFAULT_OPTIONS
    });
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

  it("setSearchResults supports special regex characters in search term", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = elementBuilder.build({
      defaultOptions: DEFAULT_OPTIONS
    });

    // Simulate search term input with regex characters
    await inputSearchTerm(element, "[ab");

    // Query for rendered list items
    const listItemEls = element.shadowRoot.querySelectorAll(
      "[data-id='list-item']"
    );
    expect(listItemEls.length).toBe(DEFAULT_OPTIONS.length);
    await assertElementIsAccesible(element);
  });

  it("focus the element", async () => {
    // Create lookup
    const element = elementBuilder.build();
    element.focus();

    // Verify focus
    expect(document.activeElement).toEqual(element);
    await assertElementIsAccesible(element);
  });

  it("blurs removes focus and closes dropdown", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = elementBuilder.build({
      defaultOptions: DEFAULT_OPTIONS
    });

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
    const element = elementBuilder.build();

    // Verify validity
    expect(element.validity).toEqual({ valid: true });
    await assertElementIsAccesible(element);
  });

  it("reports non valid when there are errors", async () => {
    // Create lookup
    const element = elementBuilder.build();
    element.setCustomValidity("Some error");

    // Verify validity
    expect(element.validity).toEqual({ valid: false });
    await assertElementIsAccesible(element);
  });
});
