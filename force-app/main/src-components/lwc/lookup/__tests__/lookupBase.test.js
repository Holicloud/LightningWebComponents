import {
  ElementBuilder,
  resetDOM,
  flushPromises,
  getByDataId,
  assertElementIsAccesible,
  assertElementIsNotAccesible,
  mockFunction
} from "test/utils";
import Lookup, { VARIANTS, LABELS, SCROLL_AFTER_N, KEY_INPUTS } from "c/Lookup";
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

const elementBuilder = new ElementBuilder(
  "c-base-lookup",
  Lookup
).setDefaultApiProperties({
  label: BASE_LABEL,
  searchHandler
});

const modes = [
  elementBuilder.setDefaultApiProperties({ isMultiEntry: true }),
  elementBuilder.setDefaultApiProperties({ isMultiEntry: false })
];

describe("c-base-lookup rendering", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it.each(modes)("displays the label", async (builder) => {
    const element = await builder.build();

    const labelEl = getByDataId(element, "label");
    expect(labelEl.textContent).toBe(BASE_LABEL);
    expect(labelEl.className).toBe("slds-form-element__label");

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "label not render when label is not provided",
    async (builder) => {
      let errorMessage;
      let element;
      try {
        element = await builder.build({
          label: ""
        });
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toBe(LABELS.errors.labelRequired);

      await assertElementIsNotAccesible(element);
    }
  );

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

  it.each(modes)("displays required indicator", async (builder) => {
    const element = await builder.build({ required: true });
    expect(getByDataId(element, "required-indicator")).toBeDefined();

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "(onblur) displays default message is required and value is missing",
    async (builder) => {
      const element = await builder.build({ required: true });

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
    }
  );

  it.each(modes)(
    "(onblur) displays custom message is required and value is missing",
    async (builder) => {
      const messageWhenValueMissing = "Please enter a value";
      const element = await builder.build({
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
    }
  );

  it.each(modes)("should display placeholder", async (builder) => {
    const placeholder = "ABCDE";
    const element = await builder.build({
      placeholder
    });

    expect(getByDataId(element, "input")?.placeholder).toBe(placeholder);

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "does not execute searchHandler event when search term is under custom minimum length",
    async (builder) => {
      const element = await builder.build({
        minSearchTermLength: 3
      });
      element.searchHandler.mockClear();

      await inputSearchTerm(element, "ab");

      expect(element.searchHandler).not.toHaveBeenCalled();
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "fires searchHanlder when search term is above custom minimum length",
    async (builder) => {
      const element = await builder.build({ minSearchTermLength: 5 });
      element.searchHandler.mockClear();

      await inputSearchTerm(element, "123456");

      expect(element.searchHandler).toHaveBeenCalledTimes(1);
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "does not fire searchHandler when search term is under custom minimum length with special characters",
    async (builder) => {
      const element = await builder.build({ minSearchTermLength: 5 });
      element.searchHandler.mockClear();

      await inputSearchTerm(element, "1234*?");

      expect(element.searchHandler).not.toHaveBeenCalled();
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "fires searchHandler when search term is above custom minimum length with special characters",
    async (builder) => {
      const element = await builder.build({ minSearchTermLength: 5 });
      element.searchHandler.mockClear();

      await inputSearchTerm(element, "123456*?");

      expect(element.searchHandler).toHaveBeenCalledTimes(1);
      await assertElementIsAccesible(element);
    }
  );

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

  it.each(modes)("custom action is shown", async (builder) => {
    const newAccount = { name: "new-account", label: "New Account" };
    const newCase = { name: "new-case", label: "New Case" };
    const element = await builder.build({
      actions: [newAccount, newCase]
    });

    expect(getByDataId(element, newAccount.name)).toBeDefined();
    expect(getByDataId(element, newCase.name)).toBeDefined();

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "fires action event when action is clicked",
    async (builder) => {
      const newAccount = { name: "new-account", label: "New Account" };
      const element = await builder.build({
        actions: [newAccount]
      });

      const onaction = mockFunction(element, "action");

      getByDataId(element, newAccount.name).click();

      expect(onaction).toHaveBeenCalledWith(
        expect.objectContaining({ detail: newAccount.name })
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("correctly sets scroll after n items", async (builder) => {
    const scrollAfterNItems = 7;
    const element = await builder.build({
      scrollAfterNItems
    });

    expect(getByDataId(element, "result-list-box")?.classList).toContain(
      "slds-dropdown_length-with-icon-" + scrollAfterNItems
    );

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "correctly sets scroll after n items by default",
    async (builder) => {
      const element = await builder.build();

      expect(getByDataId(element, "result-list-box")?.classList).toContain(
        "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "correctly sets scroll after n items when invalid",
    async (builder) => {
      const element = await builder.build({
        scrollAfterNItems: "some invalid value"
      });

      expect(getByDataId(element, "result-list-box")?.classList).toContain(
        "slds-dropdown_length-with-icon-" + SCROLL_AFTER_N
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "should throw error when search handler is not a function",
    async (builder) => {
      let element;
      let errorMessage;

      try {
        element = await builder.build({
          searchHandler: "some invalid value"
        });
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toBe(LABELS.errors.invalidHandler);

      await assertElementIsNotAccesible(element);
    }
  );

  it.each(modes)(
    "validity should be falsy when custom validity is set",
    async (builder) => {
      const errorMessage = "custom error";
      const element = await builder.build();
      element.setCustomValidity(errorMessage);

      expect(element.validity).toEqual({ valid: false });

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "validity should be falsy when custom validity is cleared",
    async (builder) => {
      const errorMessage = "custom error";
      const element = await builder.build();

      element.setCustomValidity(errorMessage);
      expect(element.validity).toEqual({ valid: false });
      element.setCustomValidity("");
      expect(element.validity).toEqual({ valid: true });

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("should focus input", async (builder) => {
    const element = await builder.build();

    const mocked = mockFunction(getByDataId(element, "input"), "focus");

    element.focus();

    expect(mocked).toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it.each(modes)("(onfocus) should dispatch focus event", async (builder) => {
    const element = await builder.build();

    const input = getByDataId(element, "input");
    const mocked = mockFunction(element, "focus");

    input.focus();

    expect(mocked).toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it.each(modes)("(onblur) should dispatch blur event", async (builder) => {
    const element = await builder.build();

    const mocked = mockFunction(getByDataId(element, "input"), "blur");

    element.focus();
    element.blur();

    expect(mocked).toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "should display error when invalid return value on the search handler",
    async (builder) => {
      const element = await builder.build({
        searchHandler: () => "invalid return"
      });

      expect(getByDataId(element, "help-message")?.textContent).toBe(
        LABELS.errors.errorFetchingData
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "data from search handler is used to populate default options",
    async (builder) => {
      const element = await builder.build();

      expect(element.searchHandler).toHaveBeenCalledWith(
        expect.objectContaining({ getDefault: true })
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("default options get displayed", async (builder) => {
    const element = await builder.build();

    expect(element.searchHandler).toHaveBeenCalledWith(
      expect.objectContaining({ getDefault: true })
    );

    expect(element.shadowRoot.querySelectorAll("[data-item-id]")?.length).toBe(
      searchHandler({ getDefault: true }).length
    );
    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "executes the searchHandler when user types on input",
    async (builder) => {
      const element = await builder.build();
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
    }
  );

  it.each(modes)(
    "does not execute searchHandler when search term is too short with whitespace",
    async (builder) => {
      const element = await builder.build();
      element.searchHandler.mockClear();

      await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_WHITESPACE);

      expect(element.searchHandler).not.toHaveBeenCalled();
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "does not execute searchHandler when search term is too short with special chars",
    async (builder) => {
      const element = await builder.build();
      element.searchHandler.mockClear();

      await inputSearchTerm(element, SAMPLE_SEARCH_TOO_SHORT_SPECIAL);

      expect(element.searchHandler).not.toHaveBeenCalled();
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "does not fire searchHandler twice when search term matches clean search term",
    async (builder) => {
      const element = await builder.build();
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
    }
  );

  it.each(modes)(
    "shows no results when there are no options",
    async (builder) => {
      const element = await builder.build({
        searchHandler: () => {
          return [];
        }
      });

      const noResultsElement = getByDataId(element, "no-result-or-loading");
      expect(noResultsElement?.textContent).toBe(LABELS.noResults);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("shows default search results by default", async (builder) => {
    const element = await builder.build();
    await flushPromises();

    const listItemEls = element.shadowRoot.querySelectorAll("[data-item-id]");
    expect(listItemEls.length).toBe(DEFAULT_OPTIONS.length);
    expect(listItemEls[0].dataset.itemId).toBe(DEFAULT_OPTIONS[0].id);

    await assertElementIsAccesible(element);
  });

  it.each(modes)("blurs on error and closes dropdown", async (builder) => {
    const element = await builder.build();
    element.setCustomValidity("Some Error");
    element.reportValidity();

    await flushPromises();

    expect(document.activeElement).not.toBe(element);
    const dropdownEl = getByDataId(element, "input");
    expect(dropdownEl.classList).not.toContain("slds-is-open");

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "displays default options when focus is gained",
    async (builder) => {
      const element = await builder.build();

      getByDataId(element, "input").focus();

      expect(document.activeElement).toEqual(element);
      const results = element.shadowRoot.querySelectorAll(
        '[data-id="list-item"]'
      );
      expect(results.length).toBe(DEFAULT_OPTIONS.length);
      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)("renders valid options", async (builder) => {
    // Create lookup
    const element = await builder.build();
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

  it.each(modes)("should display options when focus", async (builder) => {
    const element = await builder.build();

    getByDataId(element, "input").focus();

    await flushPromises();

    expect(getByDataId(element, "list-item", true)?.length).toBe(
      DEFAULT_OPTIONS.length
    );
    expect(getByDataId(element, "dropdown")?.classList).toContain(
      "slds-is-open"
    );

    await assertElementIsAccesible(element);
  });

  it.each(modes)(
    "should remove selected option and hide results when backspace or del is pressed",
    async (builder) => {
      const element = await builder.build();

      // select an option
      element.shadowRoot.querySelector("[data-item-id]").click();

      await flushPromises();

      expect(getByDataId(element, "list-item", true)?.length).toBe(
        DEFAULT_OPTIONS.length - 1
      );

      // users clears option using backspace or delete
      const searchInput = getByDataId(element, "input");
      searchInput.focus();
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.BACKSPACE })
      );

      await flushPromises();

      expect(getByDataId(element, "list-item", true)?.length).toBe(
        DEFAULT_OPTIONS.length
      );
      expect(getByDataId(element, "dropdown")?.classList).not.toContain(
        "slds-is-open"
      );

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "should show options when enter or space is pressed",
    async (builder) => {
      const element = await builder.build();

      // select an option
      element.shadowRoot.querySelector("[data-item-id]").click();

      await flushPromises();

      const searchInput = getByDataId(element, "input");
      searchInput.focus();
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.BACKSPACE })
      );
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
      );

      await flushPromises();

      expect(getByDataId(element, "list-item", true)?.length).toBe(
        DEFAULT_OPTIONS.length
      );
      expect(getByDataId(element, "dropdown")?.classList).toContain(
        "slds-is-open"
      );

      await assertElementIsAccesible(element);
    }
  );
});
