import { ElementBuilder, resetDOM, assertElementIsAccesible } from "test/utils";
import BaseLookup, { KEY_INPUTS } from "c/baseLookup";
import SAMPLE_SEARCH_ITEMS from "./data/searchItems.json";
import { inputSearchTerm } from "./baseLookup.utils.js";

const SAMPLE_SEARCH = "sample";

describe("c-base-lookup event handling", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    BaseLookup
  ).setDefaultApiProperties({ label: "Lookup Input" });

  afterEach(() => {
    resetDOM();
  });

  it("can clear selection when single entry", async () => {
    // Create lookup
    const element = elementBuilder.build({
      isMultiEntry: false,
      value: SAMPLE_SEARCH_ITEMS[0]
    });

    // Clear selection
    const clearSelButton = element.shadowRoot.querySelector("button");
    clearSelButton.click();
    // Check selection
    expect(element.value.length).toBe(0);

    await assertElementIsAccesible(element);
  });

  it("can clear selection when multi entry", () => {
    // Create lookup
    const element = elementBuilder.build({
      isMultiEntry: true,
      value: SAMPLE_SEARCH_ITEMS
    });

    // Remove a selected item
    const selPills = element.shadowRoot.querySelectorAll("lightning-pill");
    selPills[0].dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(element.value.length).toBe(SAMPLE_SEARCH_ITEMS.length - 1);
  });

  it("doesn't remove pill when multi entry and disabled", async () => {
    // Create lookup
    const element = elementBuilder.build({
      isMultiEntry: true,
      disabled: true,
      value: SAMPLE_SEARCH_ITEMS
    });

    // Remove a selected item
    const selPills = element.shadowRoot.querySelectorAll("lightning-pill");
    selPills[0].dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(element.value.length).toBe(SAMPLE_SEARCH_ITEMS.length);
    await assertElementIsAccesible(element);
  });

  it("can select item with mouse", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = elementBuilder.build();
    const searchFn = (event) => {
      event.target.defaultSearchResults = SAMPLE_SEARCH_ITEMS;
    };
    element.addEventListener("search", searchFn);

    // Simulate search term input
    await inputSearchTerm(element, SAMPLE_SEARCH);

    // Simulate mouse selection
    const searchResultItem =
      element.shadowRoot.querySelector("div[data-recordid]");
    searchResultItem.click();

    // Check selection
    expect(element.value.length).toBe(1);
    expect(element.value[0].id).toBe(SAMPLE_SEARCH_ITEMS[0].id);
    await assertElementIsAccesible(element);
  });

  it("can select item with keyboard", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = elementBuilder.build();
    const searchFn = (event) => {
      event.target.defaultSearchResults = SAMPLE_SEARCH_ITEMS;
    };
    element.addEventListener("search", searchFn);

    // Set search term and force input change
    await inputSearchTerm(element, SAMPLE_SEARCH);

    // Simulate keyboard navigation
    const searchInput = element.shadowRoot.querySelector("input");
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ARROW_DOWN })
    );
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
    );

    // Check selection
    expect(element.value.length).toBe(1);
    expect(element.value[0].id).toBe(SAMPLE_SEARCH_ITEMS[0].id);
    await assertElementIsAccesible(element);
  });

  it("custom action is shown", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler and new record options
    const actions = [{ name: "NewAccount", label: "New Account" }];
    const element = elementBuilder.build({ actions });
    const searchFn = (event) => {
      event.target.defaultSearchResults = [];
    };
    const actionFn = jest.fn();
    element.addEventListener("search", searchFn);
    element.addEventListener("action", actionFn);

    // Simulate search term inp ut
    await inputSearchTerm(element, SAMPLE_SEARCH);

    // Simulate mouse selection
    const newRecordEl = element.shadowRoot.querySelector("div[data-name]");
    expect(newRecordEl).not.toBeNull();
    await assertElementIsAccesible(element);
  });
});
