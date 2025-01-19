import {
  ElementBuilder,
  resetDOM,
  assertElementIsAccesible,
  getByDataId
} from "test/utils";
import BaseLookup, { KEY_INPUTS } from "c/baseLookup";
import OPTIONS from "./data/options.json";
import DEFAULT_OPTIONS from "./data/defaultOptions.json";
import { inputSearchTerm } from "./baseLookup.utils.js";

const SAMPLE_SEARCH = "sample";

describe("c-base-lookup event handling", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    BaseLookup
  ).setDefaultApiProperties({
    searchHandler: ({ getDefault }) => {
      return getDefault ? DEFAULT_OPTIONS : OPTIONS;
    },
    label: "Lookup Input"
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetDOM();
    jest.useRealTimers();
  });

  it("can clear selection when single entry", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      isMultiEntry: false,
      value: OPTIONS[0].id
    });
    const changeFn = jest.fn();
    element.addEventListener("change", changeFn);

    // Clear selection
    getByDataId(element, "remove").click();
    // Check selection
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

  it("can clear selection when multi entry", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      isMultiEntry: true,
      value: OPTIONS.map((result) => result.id)
    });

    const changeFn = jest.fn();
    element.addEventListener("change", changeFn);

    // Remove a selected item
    getByDataId(element, "pill").dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(element.value.length).toBe(OPTIONS.length - 1);

    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: OPTIONS.slice(1).map((option) => option.id),
          info: OPTIONS.slice(1)
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("doesn't remove pill when multi entry and disabled", async () => {
    // Create lookup
    const element = await elementBuilder.build({
      isMultiEntry: true,
      disabled: true,
      value: OPTIONS.map((result) => result.id)
    });

    const changeFn = jest.fn();
    element.addEventListener("change", changeFn);

    // Remove a selected item
    getByDataId(element, "pill").dispatchEvent(new CustomEvent("remove"));
    // Check selection
    expect(element.value.length).toBe(OPTIONS.length);
    expect(changeFn).not.toHaveBeenCalled();
    await assertElementIsAccesible(element);
  });

  it("can select item with mouse", async () => {
    const element = await elementBuilder.build();
    const changeFn = jest.fn();
    element.addEventListener("change", changeFn);

    // Simulate search term input
    await inputSearchTerm(element, SAMPLE_SEARCH);

    // Simulate mouse selection
    element.shadowRoot.querySelector("div[data-item-id]").click();

    // Check selection
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

  it("can select item with keyboard", async () => {
    const element = await elementBuilder.build();
    const changeFn = jest.fn();
    element.addEventListener("change", changeFn);

    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    // Set search term and force input change
    await inputSearchTerm(element, SAMPLE_SEARCH);

    // Simulate keyboard navigation
    const searchInput = getByDataId(element, "input");
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ARROW_DOWN })
    );
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: KEY_INPUTS.ENTER })
    );

    // Check selection
    expect(element.value).toEqual(OPTIONS[0].id);
    expect(scrollIntoView).toHaveBeenCalled();
    expect(changeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: OPTIONS[0].id,
          info: OPTIONS[0]
        }
      })
    );
    await assertElementIsAccesible(element);
  });

  it("custom action is shown", async () => {
    const element = await elementBuilder.build({
      actions: [{ name: "NewAccount", label: "New Account" }]
    });
    const actionFn = jest.fn();
    element.addEventListener("action", actionFn);

    // Simulate search term inp ut
    await inputSearchTerm(element, SAMPLE_SEARCH);

    // Simulate mouse selection
    const newRecordEl = element.shadowRoot.querySelector("div[data-name]");
    expect(newRecordEl).not.toBeNull();
    await assertElementIsAccesible(element);
  });
});
