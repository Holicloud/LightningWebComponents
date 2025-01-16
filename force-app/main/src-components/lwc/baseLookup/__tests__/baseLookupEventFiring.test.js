import { ElementBuilder, resetDOM, assertElementIsAccesible } from "test/utils";
import BaseLookup from "c/baseLookup";
import SAMPLE_SEARCH_ITEMS from "./data/searchItems.json";
import { inputSearchTerm } from "./baseLookup.utils.js";

const SAMPLE_SEARCH_TOO_SHORT_WHITESPACE = "A ";
const SAMPLE_SEARCH_TOO_SHORT_SPECIAL = "a*";
const SAMPLE_SEARCH_RAW = "Sample search* ";
const SAMPLE_SEARCH_CLEAN = "sample search?";

describe("c-base-lookup event fires", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    BaseLookup
  ).setDefaultApiProperties({ label: "Lookup Input" });

  afterEach(() => {
    resetDOM();
  });

  it("fires search event", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler
    const element = elementBuilder.build({
      isMultiEntry: true,
      value: SAMPLE_SEARCH_ITEMS
    });
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, SAMPLE_SEARCH_RAW);

    // Check fired search event
    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    const searchEvent = mockSearchFn.mock.calls[0][0];
    expect(searchEvent.detail).toEqual({
      searchTerm: SAMPLE_SEARCH_CLEAN,
      rawSearchTerm: SAMPLE_SEARCH_RAW,
      selectedIds: ["id1", "id2"]
    });

    await assertElementIsAccesible(element);
  });

  it("does not fire search event when search term is too short with whitespace", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler
    const element = elementBuilder.build();
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_WHITESPACE);

    // Check that search event wasn't fired
    expect(mockSearchFn).not.toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it("does not fire search event when search term is too short with special chars", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler
    const element = elementBuilder.build();
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_SPECIAL);

    // Check that search event wasn't fired
    expect(mockSearchFn).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("does not fire search event when search term is under custom minimum length", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler and custom minimum search term length
    const element = elementBuilder.build({
      minSearchTermLength: 3
    });
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, "ab");

    // Check that search event wasn't fired
    expect(mockSearchFn).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("fires search event when search term is above custom minimum length", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler
    const element = elementBuilder.build({ minSearchTermLength: 5 });
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, "123456");

    // Check fired search event
    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });

  it("does not fire search event when search term is under custom minimum length with special characters", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler and custom minimum search term length
    const element = elementBuilder.build({ minSearchTermLength: 5 });
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, "1234*?");

    // Check that search event wasn't fired
    expect(mockSearchFn).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("fires search event when search term is above custom minimum length with special characters", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler
    const element = elementBuilder.build({ minSearchTermLength: 5 });
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, "123456*?");

    // Check fired search event
    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });

  it("does not fire search event twice when search term matches clean search term", async () => {
    jest.useFakeTimers();

    // Create lookup with mock search handler
    const element = elementBuilder.build();
    const mockSearchFn = jest.fn();
    element.addEventListener("search", mockSearchFn);

    // Simulate search term input
    inputSearchTerm(element, SAMPLE_SEARCH_RAW);

    // Simulate search term input a second time
    inputSearchTerm(element, SAMPLE_SEARCH_CLEAN);

    // Check fired search events
    expect(mockSearchFn).toHaveBeenCalledTimes(1);
    const searchEvent = mockSearchFn.mock.calls[0][0];
    expect(searchEvent.detail).toEqual({
      searchTerm: SAMPLE_SEARCH_CLEAN,
      rawSearchTerm: SAMPLE_SEARCH_RAW,
      selectedIds: []
    });

    await assertElementIsAccesible(element);
  });

  it("fires action event when action is clicked", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler and new record options
    const actions = [{ name: "NewAccount", label: "New Account" }];
    const element = elementBuilder.build({ actions });
    const mockSearchFn = jest.fn();
    const actionFn = jest.fn();
    element.addEventListener("search", mockSearchFn);
    element.addEventListener("action", actionFn);

    // Simulate search term input
    await inputSearchTerm(element, SAMPLE_SEARCH_RAW);

    // Simulate mouse selection
    const newRecordEl = element.shadowRoot.querySelector("div[data-name]");
    newRecordEl.click();

    // Check fired search event
    expect(newRecordEl).not.toBeNull();
    expect(actionFn).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });
});
