import {
  ElementBuilder,
  flushPromises,
  getByDataId,
  removeChildren
} from "test/utils";
import Lookup, { KEY_INPUTS, LABELS } from "c/Lookup";
import RECORDS from "./data/records.json";
import {
  assertDropdownIsNotVisible,
  assertDropdownIsVisible,
  assertListBoxIsVisible,
  DEFAULT_RECORDS,
  inputSearchTerm
} from "./lookup.utils.js";

const elementBuilder = new ElementBuilder("c-lookup", Lookup).setConfig({
    defaultApiProps: {
      label: "Lookup",
      searchHandler: jest.fn(() => RECORDS),
      selectionHandler: jest.fn(({ selectedIds }) => {
        return RECORDS.filter((record) => selectedIds.includes(record.id));
      }),
      defaultRecords: DEFAULT_RECORDS
    }
  }),
  multiEntry = elementBuilder.setConfig({
    defaultApiProps: { isMultiEntry: true }
  }),
  singleEntry = elementBuilder.setConfig({ isMultiEntry: false }),
  modes = [singleEntry, multiEntry];

jest.mock("c/lookupSubtitle");

describe("c-lookup rendering", () => {
  let element;

  async function isAccessible() {
    jest.useRealTimers();
    await expect(element).toBeAccessible();
  }

  const getInput = () => getByDataId(element, "input"),
    getHelpMessage = () => getByDataId(element, "help-message");

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it.each(modes)(
    "(onblur) displays default message when is required and value is missing",
    async (builder) => {
      element = await builder.build({ required: true });

      const input = getInput();
      input.focus();
      input.blur();

      await flushPromises();

      assertDropdownIsNotVisible(element);

      expect(element?.classList).toContain("slds-has-error");
      expect(getHelpMessage()?.textContent).toBe(
        LABELS.errors.completeThisField
      );

      await isAccessible();
    }
  );

  it.each(modes)(
    "(onblur) displays custom message is required and value is missing",
    async (builder) => {
      const messageWhenValueMissing = "Please enter a value";
      element = await builder.build({
        required: true,
        messageWhenValueMissing
      });

      const input = getInput();
      input.focus();
      input.blur();

      await flushPromises();

      expect(element?.classList).toContain("slds-has-error");
      expect(getHelpMessage()?.textContent).toBe(messageWhenValueMissing);

      await isAccessible();
    }
  );

  it.each(modes)(
    "search handler is called only when input is minSearchTermLength valid",
    async (builder) => {
      element = await builder.build({
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

      await isAccessible();
    }
  );

  it.each(modes)(
    "if options are not being displayed pressing enter will make the list of records appear",
    async (builder) => {
      element = await builder.build();

      await flushPromises();

      const searchInput = getInput();
      searchInput.focus();

      assertDropdownIsNotVisible(element);
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
      );

      await flushPromises();

      assertListBoxIsVisible(element, DEFAULT_RECORDS);
      assertDropdownIsVisible(element);

      expect(element).not.toBeNull();
      await isAccessible();
    }
  );

  it.each(modes)(
    "if options are not being displayed pressing space will make the list of records appear",
    async (builder) => {
      element = await builder.build();

      await flushPromises();

      const searchInput = getInput();
      searchInput.focus();

      assertDropdownIsNotVisible(element);
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.SPACE })
      );

      await flushPromises();

      assertListBoxIsVisible(element, DEFAULT_RECORDS);
      assertDropdownIsVisible(element);

      expect(element).not.toBeNull();
      await isAccessible();
    }
  );
});
