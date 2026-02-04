import {
  createMockedEventListener,
  ElementBuilder,
  flushPromises,
  getAllByDataId,
  getByDataId,
  removeChildren
} from "test/utils";
import Lookup, { LABELS } from "c/lookup";
import { DEFAULT_RECORDS, DEFAULT_CONFIG } from "./lookup.utils.js";

import RECORDS from "./data/records.json";

jest.mock("c/lookupSubtitle");

const elementBuilder = new ElementBuilder("c-lookup", Lookup).setConfig({
  defaultApiProps: { ...DEFAULT_CONFIG, isMultiEntry: true }
});

describe("c-base-lookup multi entry", () => {
  let element;

  const getOption = () => element.shadowRoot.querySelector("[data-record-id]");
  const getPills = () => getAllByDataId(element, "pill");

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("when option is not retrieved by search handler it should not be set up", async () => {
    const value = "any";
    element = await elementBuilder.build({
      searchHandler: () => {
        return [];
      },
      value
    });

    expect(element.value).toEqual([]);
    await expect(element).toBeAccessible();
  });

  it("can select item with mouse", async () => {
    element = await elementBuilder.build();
    const changeFn = createMockedEventListener(element, "change");

    getOption().click();

    expect(element.value).toEqual([DEFAULT_RECORDS[0].id]);
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: [DEFAULT_RECORDS[0].id],
          info: [DEFAULT_RECORDS[0]]
        }
      })
    );
    await expect(element).toBeAccessible();
  });

  it("disables remove button when disabled", async () => {
    element = await elementBuilder.build({
      disabled: true,
      value: [RECORDS[0].id, RECORDS[1].id]
    });

    const changeFn = createMockedEventListener(element, "change");

    getByDataId(element, "pill").dispatchEvent(new CustomEvent("remove"));

    expect(changeFn).not.toHaveBeenCalled();

    await expect(element).toBeAccessible();
  });

  it("initial selection is displayed", async () => {
    element = await elementBuilder.build({
      value: [RECORDS[0].id, RECORDS[1].id]
    });

    expect(getPills().length).toBe(2);

    await expect(element).toBeAccessible();
  });

  it("marks only selection", async () => {
    element = await elementBuilder.build({
      value: [RECORDS[0].id, RECORDS[1].id]
    });

    expect(getPills().length).toBe(2);

    element.value = [RECORDS[0].id];

    await flushPromises();

    expect(getPills().length).toBe(1);

    await expect(element).toBeAccessible();
  });

  it("should call selection handler only when trully changed", async () => {
    element = await elementBuilder.build();

    element.value = [RECORDS[0].id];
    element.value = [RECORDS[0].id];
    element.value = [RECORDS[0].id];

    expect(element.selectionHandler).toHaveBeenCalledTimes(1);
    await expect(element).toBeAccessible();
  });

  it("renders multi entry (no selection)", async () => {
    element = await elementBuilder.build();

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

    await expect(element).toBeAccessible();
  });

  it("renders pills on selection", async () => {
    element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const selPills = getPills();

    RECORDS.forEach((record) => {
      const pillEl = selPills.find(
        (pill) => pill.name === record.id && pill.title === record.title
      );
      expect(pillEl).toBeTruthy();
    });

    await expect(element).toBeAccessible();
  });

  it("can clear selection", async () => {
    // Create lookup
    element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const changeFn = createMockedEventListener(element, "change");

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
    await expect(element).toBeAccessible();
  });

  it("does not show search results when they are already selected", async () => {
    element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    const noResultElement = getByDataId(element, "no-results");
    expect(noResultElement?.textContent).toBe(LABELS.noResults);

    await expect(element).toBeAccessible();
  });

  it("sets all valid options from selected", async () => {
    // Create lookup
    element = await elementBuilder.build({
      value: RECORDS.map((result) => result.id)
    });

    expect(element.value.length).toBe(RECORDS.length);
    await expect(element).toBeAccessible();
  });
});
