import {
  ElementBuilder,
  removeChildren,
  flushPromises,
  getByDataId,
  createMockedEventListener
} from "test/utils";
import Lookup, { VARIANTS, LABELS, SCROLL_AFTER_N, KEY_INPUTS } from "c/lookup";
import RECORDS from "./data/records.json";
import {
  inputSearchTerm,
  DEFAULT_RECORDS,
  assertListBoxIsVisible,
  assertDropdownIsVisible,
  assertDropdownIsNotVisible,
  DEFAULT_CONFIG
} from "./lookup.utils.js";

const BASE_LABEL = "Lookup";
const SAMPLE_SEARCH_TOO_SHORT_WHITESPACE = "A ";
const SAMPLE_SEARCH_TOO_SHORT_SPECIAL = "a*";
const SAMPLE_SEARCH_RAW = "Sample search* ";
const SAMPLE_SEARCH_CLEAN = "Sample search?";

const elementBuilder = new ElementBuilder("c-lookup", Lookup).setConfig({
  defaultApiProps: DEFAULT_CONFIG
});
const multiEntry = elementBuilder.setConfig({
  defaultApiProps: { isMultiEntry: true }
});
const singleEntry = elementBuilder.setConfig({ isMultiEntry: false });
const modes = [multiEntry, singleEntry];

jest.mock("c/lookupSubtitle");

describe("c-lookup", () => {
  let element;

  const getResultListBox = () => getByDataId(element, "result-list-box"),
    getInput = () => getByDataId(element, "input"),
    getLabel = () => getByDataId(element, "label"),
    getHelpText = () => getByDataId(element, "help-text"),
    getSearchIcon = () => getByDataId(element, "search-icon"),
    getClearButton = () => getByDataId(element, "clear"),
    getNoResults = () => getByDataId(element, "no-results"),
    getRequiredIndicator = () => getByDataId(element, "required-indicator");

  async function isAccessible() {
    jest.useRealTimers();
    await expect(element).toBeAccessible();
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it.each(modes)("renders default options and subtitles", async (builder) => {
    element = await builder.build();
    assertListBoxIsVisible(element, DEFAULT_RECORDS);
    expect(element).not.toBeNull();
    await isAccessible();
  });

  it.each(modes)("renders default options", async (builder) => {
    element = await builder.build({
      defaultRecords: []
    });
    expect(getNoResults()).toBeTruthy();

    element.defaultRecords = DEFAULT_RECORDS;

    await flushPromises();

    assertListBoxIsVisible(element, DEFAULT_RECORDS);
    expect(element).not.toBeNull();
    await isAccessible();
  });

  it.each(modes)("displays the label", async (builder) => {
    element = await builder.build();

    const labelEl = getLabel();
    expect(labelEl.textContent).toBe(BASE_LABEL);
    expect(labelEl.className).toBe("slds-form-element__label");

    await isAccessible();
  });

  it.each(modes)(
    "input is disabled and user cannot remove items",
    async (builder) => {
      element = await builder.build({
        disabled: true
      });

      expect(getInput().disabled).toBe(true);

      await isAccessible();
    }
  );

  it.each(modes)("displays field level help", async (builder) => {
    const message = "some help text";
    element = await builder.build({ fieldLevelHelp: message });
    expect(getHelpText().content).toBe(message);

    await isAccessible();
  });

  it.each(modes)("displays indicator when is required", async (builder) => {
    element = await builder.build({ required: true });
    expect(getRequiredIndicator()).toBeDefined();

    await isAccessible();
  });

  it.each(modes)("should display placeholder", async (builder) => {
    const placeholder = "ABCDE";
    element = await builder.build({
      placeholder
    });

    expect(getInput()?.placeholder).toBe(placeholder);

    await isAccessible();
  });

  it.each(modes)(
    "hides label when variant set to label-hidden",
    async (builder) => {
      element = await builder.build({
        variant: VARIANTS.LABEL_HIDDEN
      });

      const labelEl = getLabel();
      expect(labelEl).not.toBeNull();
      expect(labelEl.classList).toContain("slds-assistive-text");

      await isAccessible();
    }
  );

  it.each(modes)(
    "horizontal label when variant set to label-inline",
    async (builder) => {
      element = await builder.build({
        variant: VARIANTS.LABEL_INLINE
      });

      expect(element.classList).toContain("slds-form-element_horizontal");

      await isAccessible();
    }
  );

  it.each(modes)(
    "custom action is shown an can be clicked",
    async (builder) => {
      const newAccount = { name: "new-account", label: "New Account" },
        newCase = { name: "new-case", label: "New Case" };
      element = await builder.build({
        actions: [newAccount, newCase]
      });
      const onaction = createMockedEventListener(element, "action");

      expect(getByDataId(element, newAccount.name)).toBeDefined();
      expect(getByDataId(element, newCase.name)).toBeDefined();

      getByDataId(element, newAccount.name).click();

      expect(onaction).toHaveBeenCalledWith(
        expect.objectContaining({ detail: newAccount.name })
      );

      await isAccessible();
    }
  );

  it.each(modes)("set scroll items class", async (builder) => {
    const scrollAfterNItems = "7";
    element = await builder.build();

    expect(getResultListBox()?.classList).toContain(
      "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
    );

    element.scrollAfterNItems = scrollAfterNItems;
    await flushPromises();

    expect(getResultListBox()?.classList).toContain(
      "slds-dropdown_length-with-icon-" + scrollAfterNItems
    );

    element.scrollAfterNItems = "some invalid value";
    await flushPromises();

    expect(getResultListBox()?.classList).toContain(
      "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
    );

    await isAccessible();
  });

  it.each(modes)(
    "shows no results when there are no options",
    async (builder) => {
      element = await builder.build({
        defaultRecords: [],
        searchHandler: () => {
          return [];
        },
        value: [RECORDS[0].id, RECORDS[2].id]
      });

      const noResultsElement = getNoResults();
      expect(noResultsElement).toBeTruthy();
      expect(noResultsElement?.textContent).toBe(LABELS.noResults);

      await isAccessible();
    }
  );

  it.each(modes)("test validity", async (builder) => {
    const errorMessage = "custom error";
    element = await builder.build();

    element.setCustomValidity(errorMessage);
    expect(element.validity).toEqual({ valid: false });

    element.setCustomValidity("");
    expect(element.validity).toEqual({ valid: true });

    expect(document.activeElement).not.toBe(element);
    assertDropdownIsNotVisible(element);

    await isAccessible();
  });

  it.each(modes)("should focus input", async (builder) => {
    element = await builder.build();

    const input = getInput(),
      mocked = createMockedEventListener(input, "focus"),
      mockedBlur = createMockedEventListener(input, "blur"),
      mockedListener = createMockedEventListener(element, "focus"),
      mockedListenerBlur = createMockedEventListener(element, "blur");

    element.focus();
    await flushPromises();

    assertListBoxIsVisible(element, DEFAULT_RECORDS);
    assertDropdownIsVisible(element);
    expect(document.activeElement).toBe(element);
    expect(mocked).toHaveBeenCalled();
    expect(mockedListener).toHaveBeenCalled();

    element.blur();
    await flushPromises();

    expect(document.activeElement).not.toBe(element);
    expect(mockedBlur).toHaveBeenCalled();
    expect(mockedListenerBlur).toHaveBeenCalled();
    assertDropdownIsNotVisible(element);

    await isAccessible();
  });

  it.each(modes)(
    "executes the searchHandler when user types on input",
    async (builder) => {
      element = await builder.build();
      element.searchHandler.mockClear();

      await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_WHITESPACE);
      expect(element.searchHandler).not.toHaveBeenCalled();

      await inputSearchTerm(element, SAMPLE_SEARCH_RAW);

      expect(element.searchHandler).toHaveBeenCalledTimes(1);
      expect(element.searchHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: SAMPLE_SEARCH_CLEAN,
          rawSearchTerm: SAMPLE_SEARCH_RAW
        })
      );

      element.searchHandler.mockClear();
      await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_SPECIAL);
      expect(element.searchHandler).not.toHaveBeenCalled();

      element.searchHandler.mockClear();
      await inputSearchTerm(element, SAMPLE_SEARCH_RAW);
      await inputSearchTerm(element, SAMPLE_SEARCH_CLEAN);

      expect(element.searchHandler).toHaveBeenCalledTimes(1);
      expect(element.searchHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: SAMPLE_SEARCH_CLEAN,
          rawSearchTerm: SAMPLE_SEARCH_RAW
        })
      );

      await isAccessible();
    }
  );

  it.each(modes)(
    "options should not be visible when user types escape",
    async (builder) => {
      element = await builder.build();

      await inputSearchTerm(element, "jlskadjflkasd");
      assertListBoxIsVisible(element, RECORDS);
      assertDropdownIsVisible(element);

      const searchInput = getInput();
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ESCAPE })
      );
      await flushPromises();
      assertListBoxIsVisible(element, RECORDS);
      assertDropdownIsNotVisible(element);
      expect(element).not.toBeNull();
      await isAccessible();
    }
  );

  it.each(modes)(
    "should clear the input and display default list items when clear button is clicked",
    async (builder) => {
      element = await builder.build();

      await inputSearchTerm(element, "any");

      getClearButton().click();

      await flushPromises();

      expect(getInput().value).toBe("");
      assertListBoxIsVisible(element, DEFAULT_RECORDS);
      assertDropdownIsVisible(element);

      await isAccessible();
    }
  );

  it.each(modes)("should hide search icon when user typed", async (builder) => {
    element = await builder.build();

    await inputSearchTerm(element, "any");

    getClearButton().click();

    await flushPromises();

    expect(getSearchIcon()).toBeDefined();
    await isAccessible();
  });

  it.each(modes)(
    "should hide clear icon when the user has not put input anything",
    async (builder) => {
      element = await builder.build();

      await inputSearchTerm(element, "any");

      expect(getClearButton()).toBeDefined();
      expect(getSearchIcon()).toBeFalsy();

      getClearButton().click();

      await flushPromises();

      expect(getSearchIcon()).toBeDefined();
      expect(getClearButton()).toBeFalsy();

      await isAccessible();
    }
  );

  it.each(modes)("should highlight title on match", async (builder) => {
    const filterByTitle = (word) =>
      RECORDS.filter((record) => record.title.includes(word));
    element = await builder.build({
      searchHandler: ({ searchTerm }) => filterByTitle(searchTerm),
      highlightTittleOnMatch: true
    });

    const word = "Sales";

    await inputSearchTerm(element, "Sales");

    await flushPromises();

    assertListBoxIsVisible(element, filterByTitle(word), word);
    assertDropdownIsVisible(element);

    expect(element).not.toBeNull();
    await isAccessible();
  });

  it.each(modes)("can select item with keyboard", async (builder) => {
    element = await builder.build();
    const changeFn = createMockedEventListener(element, "change");
    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    element.focus();

    const searchInput = getInput();
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ARROW_DOWN })
    );

    expect(scrollIntoView).toHaveBeenCalled();

    await flushPromises();

    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
    );

    await flushPromises();

    const info = element.isMultiEntry
      ? [DEFAULT_RECORDS[0]]
      : DEFAULT_RECORDS[0];
    const value = element.isMultiEntry
      ? [DEFAULT_RECORDS[0].id]
      : DEFAULT_RECORDS[0].id;

    // Check selection
    expect(element.value).toEqual(value);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: value,
          info: info
        }
      })
    );
    await isAccessible();
  });
});
