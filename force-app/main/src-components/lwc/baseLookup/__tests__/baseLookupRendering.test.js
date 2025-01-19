import {
  ElementBuilder,
  resetDOM,
  flushPromises,
  getByDataId,
  assertElementIsAccesible,
  assertElementIsNotAccesible
} from "test/utils";
import BaseLookup, { VARIANTS, LABELS } from "c/baseLookup";
import OPTIONS from "./data/options.json";
import DEFAULT_OPTIONS from "./data/defaultOptions.json";
import { inputSearchTerm } from "./baseLookup.utils.js";

const BASE_LABEL = "Lookup";

describe("c-base-lookup rendering", () => {
  const elementBuilder = new ElementBuilder(
    "c-base-lookup",
    BaseLookup
  ).setDefaultApiProperties({
    options: OPTIONS,
    label: BASE_LABEL
  });

  afterEach(() => {
    resetDOM();
  });

  it("shows no results by default", async () => {
    const element = elementBuilder.build({
      options: []
    });

    // Query for rendered list items
    const noResultsElement = getByDataId(element, "no-result-or-loading");
    expect(noResultsElement?.textContent).toBe(LABELS.noResults);

    await assertElementIsAccesible(element);
  });

  it("shows default search results by default", async () => {
    const element = elementBuilder.build({
      defaultOptions: DEFAULT_OPTIONS
    });
    await flushPromises();

    // Query for rendered list items
    const listItemEls = element.shadowRoot.querySelectorAll("[data-item-id]");
    expect(listItemEls.length).toBe(DEFAULT_OPTIONS.length);
    expect(listItemEls[0].dataset.itemId).toBe(DEFAULT_OPTIONS[0].id);

    await assertElementIsAccesible(element);
  });

  it("renders label by default", async () => {
    const element = elementBuilder.build();

    // Verify label
    const labelEl = getByDataId(element, "label");
    expect(labelEl.textContent).toBe(BASE_LABEL);
    expect(labelEl.className).toBe("slds-form-element__label");

    await assertElementIsAccesible(element);
  });

  it("does not render label if omitted", async () => {
    const element = elementBuilder.build({ label: "" });

    // Verify label doesn't exist
    const labelEl = getByDataId(element, "label");
    expect(labelEl).toBe(null);

    // Failure to provide a label break accessibility
    await assertElementIsNotAccesible(element);
  });

  it("renders but hides label when variant set to label-hidden", async () => {
    const element = elementBuilder.build({
      label: "Sample Lookup",
      variant: VARIANTS.LABEL_HIDDEN
    });

    // Verify label
    const labelEl = getByDataId(element, "label");
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList).toContain("slds-assistive-text");

    await assertElementIsAccesible(element);
  });

  it("renders horizontal label when variant set to label-inline", async () => {
    const element = elementBuilder.build({
      label: "Sample Lookup",
      variant: VARIANTS.LABEL_INLINE
    });

    // Verify form element
    expect(element.classList).toContain("slds-form-element_horizontal");

    await assertElementIsAccesible(element);
  });

  it("renders single entry (no selection)", async () => {
    const element = elementBuilder.build({ isMultiEntry: false });

    // Verify selected icon
    const selIcon = getByDataId(element, "search-icon");
    expect(selIcon.alternativeText).toBe("Search icon");
    // Verify clear selection button
    const clearSelButton = getByDataId(element, "remove");
    expect(clearSelButton.title).toBe("Remove selected option");
    // Verify result list is NOT rendered
    const selList = element.shadowRoot.querySelectorAll(
      '[data-id="selected-options"]'
    );
    expect(selList.length).toBe(0);

    await assertElementIsAccesible(element);
  });

  it("renders multi entry (no selection)", async () => {
    const element = elementBuilder.build({ isMultiEntry: true });

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

  it("renders title on selection in single-select", async () => {
    const element = elementBuilder.build({
      isMultiEntry: false,
      value: OPTIONS.map((result) => result.id)
    });

    const inputBox = getByDataId(element, "input");
    expect(inputBox.title).toBe(OPTIONS[0].title);

    await assertElementIsAccesible(element);
  });

  it("renders title on selection in multi-select", async () => {
    const element = elementBuilder.build({
      isMultiEntry: true,
      value: OPTIONS.map((result) => result.id)
    });

    const inputBox = getByDataId(element, "input");
    expect(inputBox.title).toBe("");

    // Verify that default selection is showing up
    const selPills = element.shadowRoot.querySelectorAll('[data-id="pill"]');
    expect(selPills.length).toBe(OPTIONS.length);
    expect(selPills[0].title).toBe(OPTIONS[0].title);
    expect(selPills[1].title).toBe(OPTIONS[1].title);

    await assertElementIsAccesible(element);
  });

  it("does not shows default search results when they are already selected", async () => {
    const element = elementBuilder.build({
      isMultiEntry: true,
      defaultOptions: DEFAULT_OPTIONS,
      value: DEFAULT_OPTIONS.map((result) => result.id)
    });
    await flushPromises();

    // Query for rendered list items
    const noResultElement = getByDataId(element, "no-result-or-loading");
    expect(noResultElement?.textContent).toBe(LABELS.noResults);

    await assertElementIsAccesible(element);
  });

  it("renders new record creation option when no selection", async () => {
    const element = elementBuilder.build({
      options: [],
      actions: [{ name: "Account", label: "New Account" }]
    });

    // Query for rendered list items
    const noResultElement = getByDataId(element, "no-result-or-loading");
    const action = getByDataId(element, "action");

    expect(noResultElement?.textContent).toBe(LABELS.noResults);
    expect(action?.textContent).toBe("New Account");

    await assertElementIsAccesible(element);
  });

  it("can be disabled", async () => {
    const element = elementBuilder.build({
      disabled: true
    });

    // Verify that input is disabled
    const input = getByDataId(element, "input");
    expect(input.disabled).toBe(true);

    await assertElementIsAccesible(element);
  });

  it("disables clear selection button when single entry and disabled", async () => {
    // Create lookup
    const element = elementBuilder.build({
      disabled: true,
      value: OPTIONS.map((result) => result.id)
    });

    // Clear selection
    const clearSelButton = getByDataId(element, "remove");
    expect(clearSelButton.disabled).toBeTruthy();

    await assertElementIsAccesible(element);
  });

  it("renders error", async () => {
    const element = elementBuilder.build();
    const message = "Sample error";

    element.setCustomValidity(message);
    element.reportValidity();

    // Verify error
    await flushPromises();

    const error = getByDataId(element, "data-field-level-text");
    expect(error.textContent).toBe(message);

    await assertElementIsAccesible(element);
  });

  it("renders helptext by default", async () => {
    const props = { fieldLevelText: "some help text" };
    const element = elementBuilder.build(props);

    // Verify label
    const helpTextElement = getByDataId(element, "help-text");
    expect(helpTextElement.content).toBe(props.fieldLevelText);

    await assertElementIsAccesible(element);
  });

  it("blurs on error and closes dropdown", async () => {
    jest.useFakeTimers();

    // Create lookup with search handler
    const element = elementBuilder.build({
      defaultOptions: DEFAULT_OPTIONS
    });

    // Simulate search term input (forces focus on lookup and opens drowdown)
    await inputSearchTerm(element, "sample");

    // Simulate error
    element.setCustomValidity("Some Error");
    await flushPromises();

    // Check that lookup no longer has focus and that dropdown is closed
    expect(document.activeElement).not.toBe(element);
    const dropdownEl = getByDataId(element, "input");
    expect(dropdownEl.classList).not.toContain("slds-is-open");

    jest.useRealTimers();
    await assertElementIsAccesible(element);
  });
});
