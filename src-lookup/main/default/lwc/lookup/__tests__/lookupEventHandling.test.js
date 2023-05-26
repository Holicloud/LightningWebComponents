const {
  createLookupElement,
  inputSearchTerm,
  SAMPLE_SEARCH_ITEMS
} = require("./lookupTest.utils");

const SAMPLE_SEARCH = "sample";
const ARROW_DOWN = 40;
const ENTER = 13;

describe("c-lookup event handling", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("can clear selection when single entry", () => {
    // Create lookup
    const lookupEl = createLookupElement({
      isMultiEntry: false,
      value: SAMPLE_SEARCH_ITEMS[0]
    });

    // Clear selection
    const clearSelButton = lookupEl.shadowRoot.querySelector("button");
    clearSelButton.click();
    // Check selection
    expect(lookupEl.value.length).toBe(0);
  });

  it("can clear selection when multi entry", () => {
    // Create lookup
    const lookupEl = createLookupElement({
      isMultiEntry: true,
      value: SAMPLE_SEARCH_ITEMS
    });

    // Remove a selected item
    const selPills = lookupEl.shadowRoot.querySelectorAll("lightning-pill");
    selPills[0].dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(lookupEl.value.length).toBe(SAMPLE_SEARCH_ITEMS.length - 1);
  });

  it("doesn't remove pill when multi entry and disabled", () => {
    // Create lookup
    const lookupEl = createLookupElement({
      isMultiEntry: true,
      disabled: true,
      value: SAMPLE_SEARCH_ITEMS
    });

    // Remove a selected item
    const selPills = lookupEl.shadowRoot.querySelectorAll("lightning-pill");
    selPills[0].dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(lookupEl.value.length).toBe(SAMPLE_SEARCH_ITEMS.length);
  });

  it("can select item with mouse", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const lookupEl = createLookupElement();
    const searchFn = (event) => {
      event.target.setSearchResults(SAMPLE_SEARCH_ITEMS);
    };
    lookupEl.addEventListener("search", searchFn);

    // Simulate search term input
    await inputSearchTerm(lookupEl, SAMPLE_SEARCH);

    // Simulate mouse selection
    const searchResultItem =
      lookupEl.shadowRoot.querySelector("div[data-recordid]");
    searchResultItem.click();

    // Check selection
    expect(lookupEl.value.length).toBe(1);
    expect(lookupEl.value[0].id).toBe(SAMPLE_SEARCH_ITEMS[0].id);
  });

  it("can select item with keyboard", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const lookupEl = createLookupElement();
    const searchFn = (event) => {
      event.target.setSearchResults(SAMPLE_SEARCH_ITEMS);
    };
    lookupEl.addEventListener("search", searchFn);

    // Set search term and force input change
    await inputSearchTerm(lookupEl, SAMPLE_SEARCH);

    // Simulate keyboard navigation
    const searchInput = lookupEl.shadowRoot.querySelector("input");
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: ARROW_DOWN })
    );
    searchInput.dispatchEvent(new KeyboardEvent("keydown", { keyCode: ENTER }));

    // Check selection
    expect(lookupEl.value.length).toBe(1);
    expect(lookupEl.value[0].id).toBe(SAMPLE_SEARCH_ITEMS[0].id);
  });

  it("custom action is shown", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler and new record options
    const actions = [{ name: "NewAccount", label: "New Account" }];
    const lookupEl = createLookupElement({ actions });
    const searchFn = (event) => event.target.setSearchResults([]);
    const actionFn = jest.fn();
    lookupEl.addEventListener("search", searchFn);
    lookupEl.addEventListener("action", actionFn);

    // Simulate search term inp ut
    await inputSearchTerm(lookupEl, SAMPLE_SEARCH);

    // Simulate mouse selection
    const newRecordEl = lookupEl.shadowRoot.querySelector("div[data-name]");
    expect(newRecordEl).not.toBeNull();
  });
});
