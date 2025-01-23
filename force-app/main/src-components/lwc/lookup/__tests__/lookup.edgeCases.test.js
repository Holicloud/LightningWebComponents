import {
  ElementBuilder,
  resetDOM,
  flushPromises,
  getByDataId,
  assertElementIsAccesible
} from "test/utils";
import Lookup, { LABELS, KEY_INPUTS } from "c/Lookup";
import RECORDS from "./data/records.json";
import {
  inputSearchTerm,
  searchHandler,
  DEFAULT_RECORDS,
  assertListBoxIsVisible,
  assertDropdownIsNotVisible,
  assertDropdownIsVisible
} from "./lookup.utils.js";

const BASE_LABEL = "Lookup";

const elementBuilder = new ElementBuilder(
  "c-lookup",
  Lookup
).setDefaultApiProperties({
  label: BASE_LABEL,
  searchHandler
});

const modes = [
  elementBuilder.setDefaultApiProperties({ isMultiEntry: true }),
  elementBuilder.setDefaultApiProperties({ isMultiEntry: false })
];

jest.mock("c/lightningFormattedDynamicOutput");

describe("c-lookup rendering", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it.each(modes)(
    "(onblur) displays default message when is required and value is missing",
    async (builder) => {
      const element = await builder.build({ required: true });

      const input = getByDataId(element, "input");
      input.focus();
      input.blur();

      await flushPromises();

      assertDropdownIsNotVisible(element);

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

  it.each(modes)(
    "search hanlder is called only when input is minSearchTermLength valid",
    async (builder) => {
      const element = await builder.build({
        minSearchTermLength: 3
      });
      element.searchHandler.mockClear();

      await inputSearchTerm(element, "ab");
      expect(element.searchHandler).not.toHaveBeenCalled();

      element.minSearchTermLength = 5;
      await inputSearchTerm(element, "123456");
      expect(element.searchHandler).toHaveBeenCalledTimes(1);

      element.searchHandler.mockClear();
      await inputSearchTerm(element, "1234*?");
      expect(element.searchHandler).not.toHaveBeenCalled();

      element.searchHandler.mockClear();
      await inputSearchTerm(element, "123456*?");
      expect(element.searchHandler).toHaveBeenCalledTimes(1);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "if options are not being displayed presing enter will make the list of records appear",
    async (builder) => {
      const element = await builder.build();

      await flushPromises();

      const searchInput = getByDataId(element, "input");
      searchInput.focus();

      assertDropdownIsNotVisible(element);
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
      );

      await flushPromises();

      assertListBoxIsVisible(element, DEFAULT_RECORDS);
      assertDropdownIsVisible(element);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "if options are not being displayed presing enter will make the list of records appear",
    async (builder) => {
      const element = await builder.build();

      await flushPromises();

      const searchInput = getByDataId(element, "input");
      searchInput.focus();

      assertDropdownIsNotVisible(element);
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.SPACE })
      );

      await flushPromises();

      assertListBoxIsVisible(element, DEFAULT_RECORDS);
      assertDropdownIsVisible(element);

      await assertElementIsAccesible(element);
    }
  );

  it.each(modes)(
    "should options removed from keyboard and starts typing",
    async (builder) => {
      const element = await builder.build();

      // select an option
      element.shadowRoot.querySelector("[data-record-id]").click();
      await flushPromises();

      // clears input using backspace
      const searchInput = getByDataId(element, "input");
      searchInput.focus();
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.BACKSPACE })
      );

      await flushPromises();

      // types again
      await inputSearchTerm(element, "anything");

      assertListBoxIsVisible(element, RECORDS);
      assertDropdownIsVisible(element);

      await assertElementIsAccesible(element);
    }
  );
});
