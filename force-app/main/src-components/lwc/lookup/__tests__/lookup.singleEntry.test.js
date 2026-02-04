import {
  ElementBuilder,
  removeChildren,
  getByDataId,
  flushPromises,
  createMockedEventListener
} from "test/utils";
import Lookup, { KEY_INPUTS } from "c/lookup";
import RECORDS from "./data/records.json";
import {
  assertListBoxIsVisible,
  assertDropdownIsNotVisible,
  DEFAULT_RECORDS,
  DEFAULT_CONFIG
} from "./lookup.utils.js";

jest.mock("c/lookupSubtitle");

const elementBuilder = new ElementBuilder("c-lookup", Lookup).setConfig({
  defaultApiProps: DEFAULT_CONFIG
});

describe("c-base-lookup single entry", () => {
  let element;

  const getInput = () => getByDataId(element, "input"),
    getRemoveButton = () => getByDataId(element, "remove");

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should not set option when invalid", async () => {
    // Create lookup
    element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      },
      value: "any"
    });

    expect(element.value).toBe("any");
    await expect(element).toBeAccessible();
  });

  it("should trigger selection handler only when it trully changed", async () => {
    // Create lookup
    element = await elementBuilder.build();

    element.value = RECORDS[0].id;
    element.value = RECORDS[0].id;
    element.value = RECORDS[0].id;
    expect(element.selectionHandler).toHaveBeenCalledTimes(1);
    await expect(element).toBeAccessible();
  });

  it("can select item with mouse", async () => {
    element = await elementBuilder.build();
    const changeFn = createMockedEventListener(element, "change"),
      record = DEFAULT_RECORDS[0];

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
    await expect(element).toBeAccessible();
  });

  it("can clear selection when single entry", async () => {
    element = await elementBuilder.build({
      value: RECORDS[0].id
    });

    const changeFn = createMockedEventListener(element, "change");

    getRemoveButton().click();

    expect(element.value).toBeUndefined();
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: undefined,
          info: undefined
        }
      })
    );

    await expect(element).toBeAccessible();
  });

  it("disables clear selection button when single entry and disabled", async () => {
    element = await elementBuilder.build({
      disabled: true,
      value: RECORDS[0].id
    });

    expect(getRemoveButton().disabled).toBe(true);

    await expect(element).toBeAccessible();
  });

  it("should remove selected option and hide results when backspace or del is pressed", async () => {
    element = await elementBuilder.build();

    // select an option
    element.shadowRoot.querySelector("[data-record-id]").click();

    await flushPromises();

    // users clears option using backspace or delete
    const searchInput = getInput();
    searchInput.focus();
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.BACKSPACE })
    );

    await flushPromises();

    assertListBoxIsVisible(element, DEFAULT_RECORDS);
    assertDropdownIsNotVisible(element);

    await expect(element).toBeAccessible();
  });
});
