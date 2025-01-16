import {
  ElementBuilder,
  resetDOM,
  assertElementIsAccesible,
  flushPromises,
  getByDataId
} from "test/utils";
import BaseLookup from "c/baseLookup";
import SAMPLE_SEARCH_ITEMS from "./data/searchItems.json";
import { inputSearchTerm } from "./baseLookup.utils.js";

describe("c-base-lookup exposed functions", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    BaseLookup
  ).setDefaultApiProperties({ label: "Lookup Input" });

  afterEach(() => {
    resetDOM();
  });

  it("getSelection returns correct selection when initial selection is an array", async () => {
    // Create lookup
    const element = elementBuilder.build({
      value: SAMPLE_SEARCH_ITEMS
    });

    // Verify selection
    const selection = element.value;
    expect(selection.length).toBe(2);
    await assertElementIsAccesible(element);
  });

  it("getSelection returns correct selection when initial selection is a single item", async () => {
    // Create lookup
    const element = elementBuilder.build({
      value: SAMPLE_SEARCH_ITEMS[0]
    });

    // Verify selection
    const selection = element.value;
    expect(selection.length).toBe(1);
    await assertElementIsAccesible(element);
  });

  it("setSearchResults renders correct results", async () => {
    // Create lookup
    const element = elementBuilder.build();
    element.defaultSearchResults = SAMPLE_SEARCH_ITEMS;
    await flushPromises();

    // Query for rendered list items
    const listItemEls = element.shadowRoot.querySelectorAll(
      "li[data-id='listItem']"
    );
    expect(listItemEls.length).toBe(SAMPLE_SEARCH_ITEMS.length);
    const resultItemEls = listItemEls[0].querySelectorAll(
      "lightning-formatted-rich-text[data-id='subtitle']"
    );
    expect(resultItemEls.length).toBe(SAMPLE_SEARCH_ITEMS[0].subtitles.length);
    await assertElementIsAccesible(element);
  });

  it("setSearchResults supports special regex characters in search term", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = elementBuilder.build();
    const searchFn = (event) => {
      event.target.defaultSearchResults = SAMPLE_SEARCH_ITEMS;
    };
    element.addEventListener("search", searchFn);

    // Simulate search term input with regex characters
    await inputSearchTerm(element, "[ab");

    // Query for rendered list items
    const listItemEls = element.shadowRoot.querySelectorAll(
      "li[data-id='listItem']"
    );
    expect(listItemEls.length).toBe(SAMPLE_SEARCH_ITEMS.length);
    await assertElementIsAccesible(element);
  });

  it("focuses", async () => {
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
    const element = elementBuilder.build();
    const searchFn = (event) => {
      event.target.defaultSearchResults = SAMPLE_SEARCH_ITEMS;
    };
    element.addEventListener("search", searchFn);

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
