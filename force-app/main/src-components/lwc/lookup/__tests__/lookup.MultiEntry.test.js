import {
  ElementBuilder,
  resetDOM,
  getByDataId,
  flushPromises,
  assertElementIsAccesible,
  mockFunction
} from "test/utils";
import Lookup, { KEY_INPUTS, LABELS } from "c/Lookup";
import {
  searchHandler,
  DEFAULT_RECORDS,
  selectionHandler
} from "./lookup.utils.js";

import RECORDS from "./data/records.json";

jest.mock("c/lookupSubtitle");

describe("c-base-lookup multi entry", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    Lookup
  ).setDefaultApiProperties({
    label: "Lookup",
    isMultiEntry: true,
    defaultRecords: DEFAULT_RECORDS,
    searchHandler,
    selectionHandler
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("when option is not retrieved by search handler it should not be set up", async () => {
    const value = "any";
    const element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      },
      value
    });

    expect(element.value).toEqual([]);
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
    expect(element.value).toEqual([DEFAULT_RECORDS[0].id]);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: [DEFAULT_RECORDS[0].id],
          info: [DEFAULT_RECORDS[0]]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("can select item with mouse", async () => {
    const element = await elementBuilder.build();
    const changeFn = mockFunction(element, "change");

    element.shadowRoot.querySelectorAll("[data-record-id]")[0].click();

    expect(element.value).toEqual([DEFAULT_RECORDS[0].id]);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: [DEFAULT_RECORDS[0].id],
          info: [DEFAULT_RECORDS[0]]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("disables remove button when disabled", async () => {
    const element = await elementBuilder.build({
      disabled: true,
      value: [RECORDS[0].id, RECORDS[1].id]
    });

    const changeFn = mockFunction(element, "change");

    getByDataId(element, "pill").dispatchEvent(new CustomEvent("remove"));

    expect(changeFn).not.toHaveBeenCalled();

    await assertElementIsAccesible(element);
  });

  it("initial selection is displayed", async () => {
    const element = await elementBuilder.build({
      value: [RECORDS[0].id, RECORDS[1].id]
    });

    const selList = element.shadowRoot.querySelectorAll('[data-id="pill"]');
    expect(selList.length).toBe(2);

    await assertElementIsAccesible(element);
  });

  it("renders multi entry (no selection)", async () => {
    const element = await elementBuilder.build();

    // Verify selected icon is NOT rendered
    const selIcon = element.shadowRoot.querySelectorAll(
      '[data-id="search-icon"]'
    );
    expect(selIcon.length).toBe(1);
    // Verify clear selection button is NOT rendered
    const clearSelButton = getByDataId(element, "remove");
    expect(clearSelButton).toBeFalsy();
    // Verify result list is rendered
    const selList = element.shadowRoot.querySelectorAll(
      '[data-id="selected-options"]'
    );
    expect(selList.length).toBe(1);

    await assertElementIsAccesible(element);
  });

  it("renders pills on selection", async () => {
    const element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const selPills = [
      ...element.shadowRoot.querySelectorAll('[data-id="pill"]')
    ];

    RECORDS.forEach((record) => {
      const pillEl = selPills.find(
        (pill) => pill.name === record.id && pill.title === record.title
      );
      expect(pillEl).toBeTruthy();
    });

    await assertElementIsAccesible(element);
  });

  it("can clear selection", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const changeFn = mockFunction(element, "change");

    // Remove a selected item
    getByDataId(element, "pill").dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(element.value.length).toBe(RECORDS.length - 1);

    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: RECORDS.slice(1).map((option) => option.id),
          info: RECORDS.slice(1)
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("does not show search results when they are already selected", async () => {
    const element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const noResultElement = getByDataId(element, "no-results");
    expect(noResultElement?.textContent).toBe(LABELS.noResults);

    await assertElementIsAccesible(element);
  });

  it("sets all valid options from selected", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    expect(element.value.length).toBe(RECORDS.length);
    await assertElementIsAccesible(element);
  });
});
