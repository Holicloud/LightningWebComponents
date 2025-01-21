import {
  ElementBuilder,
  resetDOM,
  flushPromises,
  getByDataId,
  assertElementIsAccesible,
  assertElementIsNotAccesible,
  mockFunction
} from "test/utils";
import Lookup, { VARIANTS, LABELS, SCROLL_AFTER_N } from "c/Lookup";
import RECORDS from "./data/records.json";
import { inputSearchTerm } from "./lookup.utils.js";

const BASE_LABEL = "Lookup";
const SAMPLE_SEARCH_TOO_SHORT_WHITESPACE = "A ";
const SAMPLE_SEARCH_TOO_SHORT_SPECIAL = "a*";
const SAMPLE_SEARCH_RAW = "Sample search* ";
const SAMPLE_SEARCH_CLEAN = "Sample search?";

const DEFAULT_OPTIONS = RECORDS.filter((record) => record.recentlyViewed);

const searchHandler = jest.fn((config) => {
  const { getDefault, getInitialSelection, rawSearchTerm, selectedIds } =
    config;
  if (getDefault) {
    return DEFAULT_OPTIONS;
  } else if (getInitialSelection) {
    return RECORDS.filter((record) => selectedIds.includes(record.id));
  }

  return RECORDS.filter((record) =>
    record.title.toLowerCase().includes(rawSearchTerm.toLowerCase())
  );
});

describe("c-base-lookup rendering", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    Lookup
  ).setDefaultApiProperties({
    label: BASE_LABEL,
    isMultiEntry: true,
    searchHandler
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("displays the label", async () => {
    const element = await elementBuilder.build();

    const labelEl = getByDataId(element, "label");
    expect(labelEl.textContent).toBe(BASE_LABEL);
    expect(labelEl.className).toBe("slds-form-element__label");

    await assertElementIsAccesible(element);
  });

  it("label not render when label is not provided", async () => {
    let errorMessage;
    let element;
    try {
      element = await elementBuilder.build({
        label: ""
      });
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toBe(LABELS.errors.labelRequired);

    await assertElementIsNotAccesible(element);
  });

  it("input is disabled and user cannot remove items", async () => {
    const element = await elementBuilder.build({
      disabled: true
    });

    const input = getByDataId(element, "input");
    expect(input.disabled).toBe(true);

    await assertElementIsAccesible(element);
  });

  it("displays field level help", async () => {
    const message = "some help text";
    const element = await elementBuilder.build({ fieldLevelHelp: message });
    expect(getByDataId(element, "help-text").content).toBe(message);

    await assertElementIsAccesible(element);
  });

  it("displays indicator when is required", async () => {
    const element = await elementBuilder.build({ required: true });
    expect(getByDataId(element, "required-indicator")).toBeDefined();

    await assertElementIsAccesible(element);
  });

  it("displays required indicator", async () => {
    const element = await elementBuilder.build({ required: true });
    expect(getByDataId(element, "required-indicator")).toBeDefined();

    await assertElementIsAccesible(element);
  });

  it("(onblur) displays default message is required and value is missing", async () => {
    const element = await elementBuilder.build({ required: true });

    const input = getByDataId(element, "input");
    input.focus();
    input.blur();

    await flushPromises();

    expect(document.activeElement).not.toBe(element);
    const dropdownEl = getByDataId(element, "dropdown");
    expect(dropdownEl.classList).not.toContain("slds-is-open");

    expect(element?.classList).toContain("slds-has-error");
    expect(getByDataId(element, "help-message")?.textContent).toBe(
      LABELS.errors.completeThisField
    );

    await assertElementIsAccesible(element);
  });

  it("(onblur) displays custom message is required and value is missing", async () => {
    const messageWhenValueMissing = "Please enter a value";
    const element = await elementBuilder.build({
      required: true,
      messageWhenValueMissing
    });

    const input = getByDataId(element, "input");
    input.focus();
    input.blur();

    await flushPromises();

    expect(element?.classList).toContain("slds-has-error");
    expect(getByDataId(element, "help-message")?.textContent).toBe(
      messageWhenValueMissing
    );

    await assertElementIsAccesible(element);
  });

  it("should display placeholder", async () => {
    const placeholder = "ABCDE";
    const element = await elementBuilder.build({
      placeholder
    });

    expect(getByDataId(element, "input")?.placeholder).toBe(placeholder);

    await assertElementIsAccesible(element);
  });

  it("does not execute searchHandler event when search term is under custom minimum length", async () => {
    const element = await elementBuilder.build({
      minSearchTermLength: 3
    });
    element.searchHandler.mockClear();

    await inputSearchTerm(element, "ab");

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("fires searchHanlder when search term is above custom minimum length", async () => {
    const element = await elementBuilder.build({ minSearchTermLength: 5 });
    element.searchHandler.mockClear();

    await inputSearchTerm(element, "123456");

    expect(element.searchHandler).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });

  it("does not fire searchHandler when search term is under custom minimum length with special characters", async () => {
    const element = await elementBuilder.build({ minSearchTermLength: 5 });
    element.searchHandler.mockClear();

    await inputSearchTerm(element, "1234*?");

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("fires searchHandler when search term is above custom minimum length with special characters", async () => {
    const element = await elementBuilder.build({ minSearchTermLength: 5 });
    element.searchHandler.mockClear();

    await inputSearchTerm(element, "123456*?");

    expect(element.searchHandler).toHaveBeenCalledTimes(1);
    await assertElementIsAccesible(element);
  });

  it("hides label when variant set to label-hidden", async () => {
    const element = await elementBuilder.build({
      variant: VARIANTS.LABEL_HIDDEN
    });

    const labelEl = getByDataId(element, "label");
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList).toContain("slds-assistive-text");

    await assertElementIsAccesible(element);
  });

  it("horizontal label when variant set to label-inline", async () => {
    const element = await elementBuilder.build({
      variant: VARIANTS.LABEL_INLINE
    });

    expect(element.classList).toContain("slds-form-element_horizontal");

    await assertElementIsAccesible(element);
  });

  it("custom action is shown", async () => {
    const newAccount = { name: "new-account", label: "New Account" };
    const newCase = { name: "new-case", label: "New Case" };
    const element = await elementBuilder.build({
      actions: [newAccount, newCase]
    });

    expect(getByDataId(element, newAccount.name)).toBeDefined();
    expect(getByDataId(element, newCase.name)).toBeDefined();

    await assertElementIsAccesible(element);
  });

  it("fires action event when action is clicked", async () => {
    const newAccount = { name: "new-account", label: "New Account" };
    const element = await elementBuilder.build({
      actions: [newAccount]
    });

    const onaction = mockFunction(element, "action");

    getByDataId(element, newAccount.name).click();

    expect(onaction).toHaveBeenCalledWith(
      expect.objectContaining({ detail: newAccount.name })
    );

    await assertElementIsAccesible(element);
  });

  it("correctly sets scroll after n items", async () => {
    const scrollAfterNItems = 7;
    const element = await elementBuilder.build({
      scrollAfterNItems
    });

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + scrollAfterNItems
    );

    await assertElementIsAccesible(element);
  });

  it("correctly sets scroll after n items by default", async () => {
    const element = await elementBuilder.build();

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
    );

    await assertElementIsAccesible(element);
  });

  it("correctly sets scroll after n items when invalid", async () => {
    const element = await elementBuilder.build({
      scrollAfterNItems: "some invalid value"
    });

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
    );

    await assertElementIsAccesible(element);
  });

  it("should throw error when search handler is not a function", async () => {
    let element;
    let errorMessage;

    try {
      element = await elementBuilder.build({
        searchHandler: "some invalid value"
      });
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toBe(LABELS.errors.invalidHandler);

    await assertElementIsNotAccesible(element);
  });

  it("validity should be falsy when custom validity is set", async () => {
    const errorMessage = "custom error";
    const element = await elementBuilder.build();
    element.setCustomValidity(errorMessage);

    expect(element.validity).toEqual({ valid: false });

    await assertElementIsAccesible(element);
  });

  it("validity should be falsy when custom validity is cleared", async () => {
    const errorMessage = "custom error";
    const element = await elementBuilder.build();

    element.setCustomValidity(errorMessage);
    expect(element.validity).toEqual({ valid: false });
    element.setCustomValidity("");
    expect(element.validity).toEqual({ valid: true });

    await assertElementIsAccesible(element);
  });

  it("should focus input", async () => {
    const element = await elementBuilder.build();

    const mocked = mockFunction(getByDataId(element, "input"), "focus");

    element.focus();

    expect(mocked).toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it("(onfocus) should dispatch focus event", async () => {
    const element = await elementBuilder.build();

    const input = getByDataId(element, "input");
    const mocked = mockFunction(element, "focus");

    input.focus();

    expect(mocked).toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it("(onblur) should dispatch blur event", async () => {
    const element = await elementBuilder.build();

    const mocked = mockFunction(getByDataId(element, "input"), "blur");

    element.focus();
    element.blur();

    expect(mocked).toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it("should display error when invalid return value on the search handler", async () => {
    const element = await elementBuilder.build({
      searchHandler: () => "invalid return"
    });

    expect(getByDataId(element, "help-message")?.textContent).toBe(
      LABELS.errors.errorFetchingData
    );

    await assertElementIsAccesible(element);
  });

  it("data from search handler is used to populate default options", async () => {
    const element = await elementBuilder.build();

    expect(element.searchHandler).toHaveBeenCalledWith(
      expect.objectContaining({ getDefault: true })
    );

    await assertElementIsAccesible(element);
  });

  it("default options get displayed", async () => {
    const element = await elementBuilder.build();

    expect(element.searchHandler).toHaveBeenCalledWith(
      expect.objectContaining({ getDefault: true })
    );

    expect(element.shadowRoot.querySelectorAll("[data-item-id]")?.length).toBe(
      searchHandler({ getDefault: true }).length
    );
    await assertElementIsAccesible(element);
  });

  it("executes the searchHandler when user types on input", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockClear();

    await inputSearchTerm(element, SAMPLE_SEARCH_RAW);

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

  it("does not execute searchHandler when search term is too short with whitespace", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockClear();

    await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_WHITESPACE);

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("does not execute searchHandler when search term is too short with special chars", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockClear();

    await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_SPECIAL);

    expect(element.searchHandler).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("does not fire searchHandler twice when search term matches clean search term", async () => {
    const element = await elementBuilder.build();
    element.searchHandler.mockClear();

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

  it("shows no results when there are no options", async () => {
    const element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      }
    });

    const noResultsElement = getByDataId(element, "no-result-or-loading");
    expect(noResultsElement?.textContent).toBe(LABELS.noResults);

    await assertElementIsAccesible(element);
  });

  it("shows default search results by default", async () => {
    const element = await elementBuilder.build();
    await flushPromises();

    const listItemEls = element.shadowRoot.querySelectorAll("[data-item-id]");
    expect(listItemEls.length).toBe(DEFAULT_OPTIONS.length);
    expect(listItemEls[0].dataset.itemId).toBe(DEFAULT_OPTIONS[0].id);

    await assertElementIsAccesible(element);
  });

  it("blurs on error and closes dropdown", async () => {
    const element = await elementBuilder.build();
    element.setCustomValidity("Some Error");
    element.reportValidity();

    await flushPromises();

    expect(document.activeElement).not.toBe(element);
    const dropdownEl = getByDataId(element, "input");
    expect(dropdownEl.classList).not.toContain("slds-is-open");

    await assertElementIsAccesible(element);
  });

  it("displays default options when focus is gained", async () => {
    const element = await elementBuilder.build();

    getByDataId(element, "input").focus();

    expect(document.activeElement).toEqual(element);
    const results = element.shadowRoot.querySelectorAll(
      '[data-id="list-item"]'
    );
    expect(results.length).toBe(DEFAULT_OPTIONS.length);
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
});
