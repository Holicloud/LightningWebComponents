import {
  ElementBuilder,
  resetDOM,
  flushPromises,
  getByDataId,
  assertElementIsAccesible,
  mockFunction
} from "test/utils";
import Lookup, { VARIANTS, LABELS, SCROLL_AFTER_N, KEY_INPUTS } from "c/Lookup";
import RECORDS from "./data/records.json";
import {
  inputSearchTerm,
  searchHandler,
  DEFAULT_RECORDS,
  assertListBoxIsVisible,
  selectionHandler
} from "./lookup.utils.js";

const BASE_LABEL = "Lookup";
const SAMPLE_SEARCH_TOO_SHORT_WHITESPACE = "A ";
const SAMPLE_SEARCH_TOO_SHORT_SPECIAL = "a*";
const SAMPLE_SEARCH_RAW = "Sample search* ";
const SAMPLE_SEARCH_CLEAN = "Sample search?";

const elementBuilder = new ElementBuilder(
  "c-lookup",
  Lookup
).setDefaultApiProperties({
  label: BASE_LABEL,
  defaultRecords: DEFAULT_RECORDS,
  searchHandler,
  selectionHandler
});

const modes = [
  elementBuilder.setDefaultApiProperties({ isMultiEntry: true }),
  elementBuilder.setDefaultApiProperties({ isMultiEntry: false })
];

jest.mock("c/lookupSubtitle");

function assertDropdownIsVisible(element) {
  expect(getByDataId(element, "dropdown")?.classList).toContain("slds-is-open");
}

function assertDropdownIsNotVisible(element) {
  expect(getByDataId(element, "dropdown")?.classList).not.toContain(
    "slds-is-open"
  );
}

describe("c-lookup", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it.each(modes)("renders default options and subtitles", async (builder) => {
    // Create lookup
    const element = await builder.build();
    assertListBoxIsVisible(element, DEFAULT_RECORDS);
    await assertElementIsAccesible(element);
  });

  it.each(modes)("displays the label", async (builder) => {
    const element = await builder.build();

    const labelEl = getByDataId(element, "label");
    expect(labelEl.textContent).toBe(BASE_LABEL);
    expect(labelEl.className).toBe("slds-form-element__label");

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "input is disabled and user cannot remove items",
    async (builder) => {
      const element = await builder.build({
        disabled: true
      });

      const input = getByDataId(element, "input");
      expect(input.disabled).toBe(true);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("displays field level help", async (builder) => {
    const message = "some help text";
    const element = await builder.build({ fieldLevelHelp: message });
    expect(getByDataId(element, "help-text").content).toBe(message);

    await assertElementIsAccesible(element);
  });

  it.each(modes)("displays indicator when is required", async (builder) => {
    const element = await builder.build({ required: true });
    expect(getByDataId(element, "required-indicator")).toBeDefined();

    await assertElementIsAccesible(element);
  });

  it.each(modes)("should display placeholder", async (builder) => {
    const placeholder = "ABCDE";
    const element = await builder.build({
      placeholder
    });

    expect(getByDataId(element, "input")?.placeholder).toBe(placeholder);

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "hides label when variant set to label-hidden",
    async (builder) => {
      const element = await builder.build({
        variant: VARIANTS.LABEL_HIDDEN
      });

      const labelEl = getByDataId(element, "label");
      expect(labelEl).not.toBeNull();
      expect(labelEl.classList).toContain("slds-assistive-text");

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "horizontal label when variant set to label-inline",
    async (builder) => {
      const element = await builder.build({
        variant: VARIANTS.LABEL_INLINE
      });

      expect(element.classList).toContain("slds-form-element_horizontal");

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "custom action is shown an can be clicked",
    async (builder) => {
      const newAccount = { name: "new-account", label: "New Account" };
      const newCase = { name: "new-case", label: "New Case" };
      const element = await builder.build({
        actions: [newAccount, newCase]
      });
      const onaction = mockFunction(element, "action");

      expect(getByDataId(element, newAccount.name)).toBeDefined();
      expect(getByDataId(element, newCase.name)).toBeDefined();

      getByDataId(element, newAccount.name).click();

      expect(onaction).toHaveBeenCalledWith(
        expect.objectContaining({ detail: newAccount.name })
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("set scroll items class", async (builder) => {
    const scrollAfterNItems = 7;
    const element = await builder.build();

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
    );

    element.scrollAfterNItems = scrollAfterNItems;
    await flushPromises();

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + scrollAfterNItems
    );

    element.scrollAfterNItems = "some invalid value";
    await flushPromises();

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
    );

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "shows no results when there are no options",
    async (builder) => {
      const element = await builder.build({
        defaultRecords: [],
        searchHandler: () => {
          return [];
        },
        value: [RECORDS[0].id, RECORDS[2].id]
      });

      const noResultsElement = getByDataId(element, "no-results");
      expect(noResultsElement).toBeTruthy();
      expect(noResultsElement?.textContent).toBe(LABELS.noResults);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "should throw error when search handler is not setup properly",
    async (builder) => {
      const element = await builder.build({
        selectionHandler: () => "invalid return",
        value: RECORDS[0].id
      });

      expect(getByDataId(element, "help-message")?.textContent).toBe(
        LABELS.errors.errorFetchingData
      );
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("test validity", async (builder) => {
    const errorMessage = "custom error";
    const element = await builder.build();

    element.setCustomValidity(errorMessage);
    expect(element.validity).toEqual({ valid: false });

    element.setCustomValidity("");
    expect(element.validity).toEqual({ valid: true });

    expect(document.activeElement).not.toBe(element);
    assertDropdownIsNotVisible(element);

    await assertElementIsAccesible(element);
  });

  it.each(modes)("should focus input", async (builder) => {
    const element = await builder.build();

    const input = getByDataId(element, "input");
    const mockedListener = mockFunction(element, "focus");
    const mocked = mockFunction(input, "focus");
    const mockedListenerBlur = mockFunction(element, "blur");
    const mockedBlur = mockFunction(input, "blur");

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

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "executes the searchHandler when user types on input",
    async (builder) => {
      const element = await builder.build();
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

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "options should not be visible when user types escape",
    async (builder) => {
      const element = await builder.build();

      await inputSearchTerm(element, "jlskadjflkasd");
      assertListBoxIsVisible(element, RECORDS);
      assertDropdownIsVisible(element);

      const searchInput = getByDataId(element, "input");
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ESCAPE })
      );
      await flushPromises();
      assertListBoxIsVisible(element, RECORDS);
      assertDropdownIsNotVisible(element);
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "should clear the input and display default list items when clear button is clicked",
    async (builder) => {
      const element = await builder.build();

      await inputSearchTerm(element, "any");

      getByDataId(element, "clear").click();

      await flushPromises();

      expect(getByDataId(element, "input").value).toBe("");
      assertListBoxIsVisible(element, DEFAULT_RECORDS);
      assertDropdownIsVisible(element);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("should hide search icon when user typed", async (builder) => {
    const element = await builder.build();

    await inputSearchTerm(element, "any");

    getByDataId(element, "clear").click();

    await flushPromises();

    expect(getByDataId(element, "search-icon")).toBeDefined();
    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "should hide clear icon when the user has not put input anything",
    async (builder) => {
      const element = await builder.build();

      await inputSearchTerm(element, "any");

      expect(getByDataId(element, "clear")).toBeDefined();
      expect(getByDataId(element, "search-icon")).toBeFalsy();

      getByDataId(element, "clear").click();

      await flushPromises();

      expect(getByDataId(element, "search-icon")).toBeDefined();
      expect(getByDataId(element, "clear")).toBeFalsy();

      await assertElementIsAccesible(element);
    }
  );
});
