import {
  ElementBuilder,
  resetDOM,
  getByDataId,
  assertElementIsAccesible,
  mockFunction
} from "test/utils";
import Lookup, { KEY_INPUTS, LABELS } from "c/Lookup";
import RECORDS from "./data/records.json";

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

    expect(element.value).toBeUndefined();
    await assertElementIsAccesible(element);
  });

  it("can select item with keyboard", async () => {
    const element = await elementBuilder.build();
    const changeFn = mockFunction(element, "change");

    element.focus();

    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const searchInput = getByDataId(element, "input");
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ARROW_DOWN })
    );
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
    );

    // Check selection
    expect(element.value).toEqual(DEFAULT_OPTIONS[0].id);
    expect(scrollIntoView).toHaveBeenCalled();
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: DEFAULT_OPTIONS[0].id,
          info: DEFAULT_OPTIONS[0]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("can select item with mouse", async () => {
    const element = await elementBuilder.build();
    const changeFn = mockFunction(element, "change");

    element.shadowRoot.querySelectorAll("[data-item-id]")[0].click();

    expect(element.value).toEqual(DEFAULT_OPTIONS[0].id);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: DEFAULT_OPTIONS[0].id,
          info: DEFAULT_OPTIONS[0]
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

  it("initial selection is displayed", async () => {
    const value = RECORDS[0].id;
    const element = await elementBuilder.build({ value });

    const selIcon = getByDataId(element, "search-icon");
    expect(selIcon.alternativeText).toBe(LABELS.searchIcon);
    // Verify clear selection button
    const clearSelButton = getByDataId(element, "remove");
    expect(clearSelButton.title).toBe(LABELS.removeOption);
    // Verify result list is NOT rendered
    const selList = element.shadowRoot.querySelectorAll(
      '[data-id="selected-options"]'
    );
    expect(selList.length).toBe(0);

    expect(element.searchHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        getInitialSelection: true,
        selectedIds: [value]
      })
    );

    expect(getByDataId(element, "input").value).toBe(RECORDS[0].id);
    expect(getByDataId(element, "input").title).toBe(RECORDS[0].title);
    await assertElementIsAccesible(element);
  });
});
