import {
  ElementBuilder,
  resetDOM,
  getByDataId,
  flushPromises,
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

  it("should not set option when invalid", async () => {
    const element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      },
      value: "any"
    });

    expect(element.value).toEqual([]);
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
    expect(element.value).toEqual([DEFAULT_OPTIONS[0].id]);
    expect(scrollIntoView).toHaveBeenCalled();
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: [DEFAULT_OPTIONS[0].id],
          info: [DEFAULT_OPTIONS[0]]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("can select item with mouse", async () => {
    const element = await elementBuilder.build();
    const changeFn = mockFunction(element, "change");

    element.shadowRoot.querySelectorAll("[data-item-id]")[0].click();

    expect(element.value).toEqual([DEFAULT_OPTIONS[0].id]);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: [DEFAULT_OPTIONS[0].id],
          info: [DEFAULT_OPTIONS[0]]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("can clear selection", async () => {
    const element = await elementBuilder.build({
      value: [RECORDS[0].id, RECORDS[1].id]
    });

    const changeFn = mockFunction(element, "change");

    getByDataId(element, "pill").dispatchEvent(new CustomEvent("remove"));

    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: [RECORDS[1].id],
          info: [RECORDS[1]]
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

  it("renders title on selection in multi-select", async () => {
    const element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const inputBox = getByDataId(element, "input");
    expect(inputBox.title).toBe("");

    // Verify that default selection is showing up
    const selPills = element.shadowRoot.querySelectorAll('[data-id="pill"]');
    expect(selPills.length).toBe(RECORDS.length);
    expect(selPills[0].title).toBe(RECORDS[0].title);
    expect(selPills[1].title).toBe(RECORDS[1].title);

    await assertElementIsAccesible(element);
  });

  it("can clear selection when multi entry", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const changeFn = jest.fn();
    element.addEventListener("change", changeFn);

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
    await flushPromises();

    const noResultElement = getByDataId(element, "no-result-or-loading");
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
