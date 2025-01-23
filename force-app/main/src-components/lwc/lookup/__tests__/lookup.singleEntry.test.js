import {
  ElementBuilder,
  resetDOM,
  getByDataId,
  flushPromises,
  assertElementIsAccesible,
  mockFunction
} from "test/utils";
import Lookup, { KEY_INPUTS } from "c/Lookup";
import RECORDS from "./data/records.json";
import {
  searchHandler,
  assertListBoxIsVisible,
  assertDropdownIsNotVisible,
  DEFAULT_RECORDS
} from "./lookup.utils.js";

describe("c-base-lookup single entry", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    Lookup
  ).setDefaultApiProperties({
    label: "Lookup",
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

  it("should not set option when invalid", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      },
      value: "any"
    });

    expect(element.value).toBe("any");
    await assertElementIsAccesible(element);
  });

  it("can select item with keyboard", async () => {
    const element = await elementBuilder.build();
    const changeFn = mockFunction(element, "change");
    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    element.focus();

    const searchInput = getByDataId(element, "input");
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ARROW_DOWN })
    );

    expect(scrollIntoView).toHaveBeenCalled();

    await flushPromises();

    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
    );

    await flushPromises();

    // Check selection
    expect(element.value).toEqual(DEFAULT_RECORDS[0].id);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: DEFAULT_RECORDS[0].id,
          info: DEFAULT_RECORDS[0]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("can select item with mouse", async () => {
    const element = await elementBuilder.build();
    const changeFn = mockFunction(element, "change");
    const record = DEFAULT_RECORDS[0];

    element.shadowRoot.querySelector(`[data-record-id="${record.id}"]`).click();

    expect(element.value).toEqual(record.id);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: record.id,
          info: record
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("can clear selection when single entry", async () => {
    const element = await elementBuilder.build({
      value: RECORDS[0].id
    });

    const changeFn = mockFunction(element, "change");

    getByDataId(element, "remove").click();

    expect(element.value).toBeUndefined();
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: undefined,
          info: undefined
        }
      })
    );

    await assertElementIsAccesible(element);
  });

  it("disables clear selection button when single entry and disabled", async () => {
    const element = await elementBuilder.build({
      disabled: true,
      value: RECORDS[0].id
    });

    expect(getByDataId(element, "remove").disabled).toBe(true);

    await assertElementIsAccesible(element);
  });

  it("should remove selected option and hide results when backspace or del is pressed", async () => {
    const element = await elementBuilder.build();

    // select an option
    element.shadowRoot.querySelector("[data-record-id]").click();

    await flushPromises();

    // users clears option using backspace or delete
    const searchInput = getByDataId(element, "input");
    searchInput.focus();
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.BACKSPACE })
    );

    await flushPromises();

    assertListBoxIsVisible(element, DEFAULT_RECORDS);
    assertDropdownIsNotVisible(element);

    await assertElementIsAccesible(element);
  });
});
