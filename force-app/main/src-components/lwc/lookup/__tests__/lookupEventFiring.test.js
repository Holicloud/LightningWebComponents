import {
  ElementBuilder,
  resetDOM,
  assertElementIsAccesible,
  getByDataId
} from "test/utils";
import Lookup from "c/Lookup";
import OPTIONS from "./data/options.json";
import DEFAULT_OPTIONS from "./data/defaultOptions.json";
import { inputSearchTerm } from "./Lookup.utils.js";

const SAMPLE_SEARCH_TOO_SHORT_WHITESPACE = "A ";
const SAMPLE_SEARCH_TOO_SHORT_SPECIAL = "a*";
const SAMPLE_SEARCH_RAW = "Sample search* ";
const SAMPLE_SEARCH_CLEAN = "sample search?";

describe("c-base-lookup event fires", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    Lookup
  ).setDefaultApiProperties({
    searchHandler: jest.fn(({ getDefault }) => {
      return getDefault ? DEFAULT_OPTIONS : OPTIONS;
    }),
    label: "Lookup Input"
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("executes the searchHandler to populate default options and selected options", async () => {
    const value = OPTIONS.map((result) => result.id);
    const element = await elementBuilder.build({
      isMultiEntry: true,
      value
    });

    expect(element.searchHandler).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ getDefault: true })
    );
    expect(element.searchHandler).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ getInitialSelection: true, selectedIds: value })
    );

    await assertElementIsAccesible(element);
  });

  it("executes the searchHandler when user types on input", async () => {
    const element = await elementBuilder.build({
      isMultiEntry: true,
      value: OPTIONS.map((result) => result.id)
    });

    element.searchHandler = jest.fn();

    await inputSearchTerm(element, SAMPLE_SEARCH_RAW);

    expect(element.searchHandler).toHaveBeenCalledTimes(1);
    expect(element.searchHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: SAMPLE_SEARCH_CLEAN,
        rawSearchTerm: SAMPLE_SEARCH_RAW,
        selectedIds: OPTIONS.map((result) => result.id)
      })
    );

    await assertElementIsAccesible(element);
  });

  it("does not execute searchHandler when search term is too short with whitespace", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockReset();

    await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_WHITESPACE);

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("does not execute searchHandler when search term is too short with special chars", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockReset();

    await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_SPECIAL);

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("does not execute searchHandler event when search term is under custom minimum length", async () => {
    const element = await elementBuilder.build({
      minSearchTermLength: 3
    });
    element.searchHandler.mockReset();

    await inputSearchTerm(element, "ab");

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("fires searchHanlder when search term is above custom minimum length", async () => {
    const element = await elementBuilder.build({ minSearchTermLength: 5 });
    element.searchHandler.mockReset();

    await inputSearchTerm(element, "123456");

    expect(element.searchHandler).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });

  it("does not fire searchHandler when search term is under custom minimum length with special characters", async () => {
    const element = await elementBuilder.build({ minSearchTermLength: 5 });
    element.searchHandler.mockReset();

    await inputSearchTerm(element, "1234*?");

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("fires searchHandler when search term is above custom minimum length with special characters", async () => {
    const element = await elementBuilder.build({ minSearchTermLength: 5 });
    element.searchHandler.mockReset();

    await inputSearchTerm(element, "123456*?");

    expect(element.searchHandler).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });

  it("does not fire searchHandler twice when search term matches clean search term", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockReset();

    await inputSearchTerm(element, SAMPLE_SEARCH_RAW);
    await inputSearchTerm(element, SAMPLE_SEARCH_CLEAN);

    expect(element.searchHandler).toHaveBeenCalledTimes(1);
    expect(element.searchHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: SAMPLE_SEARCH_CLEAN,
        rawSearchTerm: SAMPLE_SEARCH_RAW,
        selectedIds: []
      })
    );

    await assertElementIsAccesible(element);
  });

  it("fires action event when action is clicked", async () => {
    const element = await elementBuilder.build({
      actions: [{ name: "NewAccount", label: "New Account" }]
    });
    const actionFn = jest.fn();
    element.addEventListener("action", actionFn);

    await inputSearchTerm(element, SAMPLE_SEARCH_RAW);

    const newRecordEl = getByDataId(element, "action-button");
    newRecordEl.click();

    expect(newRecordEl).not.toBeNull();
    expect(actionFn).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });
});
