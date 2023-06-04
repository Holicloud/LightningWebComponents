const {
  createLookupElement,
  flushPromises,
  SAMPLE_SEARCH_ITEMS,
  LABEL_NO_RESULTS
} = require("./lookupTest.utils");

describe("c-lookup rendering", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("shows no results by default", async () => {
    const lookupEl = createLookupElement();

    // Query for rendered list items
    const listItemEls = lookupEl.shadowRoot.querySelectorAll("li");
    expect(listItemEls.length).toBe(1);
    expect(listItemEls[0].textContent).toBe(LABEL_NO_RESULTS);

    await expect(lookupEl).toBeAccessible();
  });

  it("shows default search results by default", async () => {
    const lookupEl = createLookupElement();
    lookupEl.setDefaultResults(SAMPLE_SEARCH_ITEMS);
    await flushPromises();

    // Query for rendered list items
    const listItemEls =
      lookupEl.shadowRoot.querySelectorAll("div[role=option]");
    expect(listItemEls.length).toBe(SAMPLE_SEARCH_ITEMS.length);
    expect(listItemEls[0].dataset.recordid).toBe(SAMPLE_SEARCH_ITEMS[0].id);

    await expect(lookupEl).toBeAccessible();
  });

  it("renders label by default", async () => {
    const props = { label: "Sample Lookup" };
    const lookupEl = createLookupElement(props);

    // Verify label
    const labelEl = lookupEl.shadowRoot.querySelector("label");
    expect(labelEl.textContent).toBe(props.label);
    expect(labelEl.className).toBe("slds-form-element__label");
    expect(labelEl.textContent).toBe(props.label);

    await expect(lookupEl).toBeAccessible();
  });

  it("does not render label if omitted", async () => {
    const lookupEl = createLookupElement({ label: "" });

    // Verify label doesn't exist
    const labelEl = lookupEl.shadowRoot.querySelector("label");
    expect(labelEl).toBe(null);

    // Failure to provide a label break accessibility
    await expect(lookupEl).not.toBeAccessible();
  });

  it("renders but hides label when variant set to label-hidden", async () => {
    const props = {
      label: "Sample Lookup",
      variant: "label-hidden"
    };
    const lookupEl = createLookupElement(props);

    // Verify label
    const labelEl = lookupEl.shadowRoot.querySelector("label");
    expect(labelEl).not.toBeNull();
    expect(labelEl.classList).toContain("slds-assistive-text");

    await expect(lookupEl).toBeAccessible();
  });

  it("renders horizontal label when variant set to label-inline", async () => {
    const props = {
      label: "Sample Lookup",
      variant: "label-inline"
    };
    const lookupEl = createLookupElement(props);

    // Verify form element
    expect(lookupEl.classList).toContain("slds-form-element_horizontal");

    await expect(lookupEl).toBeAccessible();
  });

  it("renders single entry (no selection)", async () => {
    const lookupEl = createLookupElement({ isMultiEntry: false });

    // Verify selected icon
    const selIcon = lookupEl.shadowRoot.querySelector("lightning-icon");
    expect(selIcon.alternativeText).toBe("Selected item icon");
    // Verify clear selection button
    const clearSelButton = lookupEl.shadowRoot.querySelector("button");
    expect(clearSelButton.title).toBe("Remove selected option");
    // Verify result list is NOT rendered
    const selList = lookupEl.shadowRoot.querySelectorAll(
      "ul.slds-listbox_inline"
    );
    expect(selList.length).toBe(0);

    await expect(lookupEl).toBeAccessible();
  });

  it("renders multi entry (no selection)", async () => {
    const lookupEl = createLookupElement({ isMultiEntry: true });

    // Verify selected icon is NOT rendered
    const selIcon = lookupEl.shadowRoot.querySelectorAll("lightning-icon");
    expect(selIcon.length).toBe(1);
    // Verify clear selection button is NOT rendered
    const clearSelButton = lookupEl.shadowRoot.querySelectorAll("button");
    expect(clearSelButton.length).toBe(0);
    // Verify result list is rendered
    const selList = lookupEl.shadowRoot.querySelectorAll(
      "ul.slds-listbox_inline"
    );
    expect(selList.length).toBe(1);

    await expect(lookupEl).toBeAccessible();
  });

  it("renders title on selection in single-select", async () => {
    const lookupEl = createLookupElement({
      isMultiEntry: false,
      value: SAMPLE_SEARCH_ITEMS[0]
    });

    const inputBox = lookupEl.shadowRoot.querySelector("input");
    expect(inputBox.title).toBe(SAMPLE_SEARCH_ITEMS[0].title);

    await expect(lookupEl).toBeAccessible();
  });

  it("renders title on selection in multi-select", async () => {
    const lookupEl = createLookupElement({
      isMultiEntry: true,
      value: SAMPLE_SEARCH_ITEMS
    });

    const inputBox = lookupEl.shadowRoot.querySelector("input");
    expect(inputBox.title).toBe("");

    // Verify that default selection is showing up
    const selPills = lookupEl.shadowRoot.querySelectorAll("lightning-pill");
    expect(selPills.length).toBe(2);
    expect(selPills[0].title).toBe(SAMPLE_SEARCH_ITEMS[0].title);
    expect(selPills[1].title).toBe(SAMPLE_SEARCH_ITEMS[1].title);

    await expect(lookupEl).toBeAccessible();
  });

  it("does not shows default search results when they are already selected", async () => {
    const lookupEl = createLookupElement({
      isMultiEntry: true,
      value: SAMPLE_SEARCH_ITEMS
    });
    lookupEl.setDefaultResults(SAMPLE_SEARCH_ITEMS);
    await flushPromises();

    // Query for rendered list items
    const listItemEls = lookupEl.shadowRoot.querySelectorAll(
      "li span.slds-media__body"
    );
    expect(listItemEls.length).toBe(1);
    expect(listItemEls[0].textContent).toBe(LABEL_NO_RESULTS);

    await expect(lookupEl).toBeAccessible();
  });

  it("renders new record creation option when no selection", async () => {
    const lookupEl = createLookupElement({
      actions: [{ name: "Account", label: "New Account" }]
    });

    // Query for rendered list items
    const listItemEls = lookupEl.shadowRoot.querySelectorAll(
      "li span.slds-media__body"
    );
    expect(listItemEls.length).toBe(2);
    expect(listItemEls[0].textContent).toBe("No results.");
    expect(listItemEls[1].textContent).toBe("New Account");

    await expect(lookupEl).toBeAccessible();
  });

  it("can be disabled", async () => {
    const lookupEl = createLookupElement({
      disabled: true
    });

    // Verify that input is disabled
    const input = lookupEl.shadowRoot.querySelector("input");
    expect(input.disabled).toBe(true);

    await expect(lookupEl).toBeAccessible();
  });

  it("disables clear selection button when single entry and disabled", async () => {
    // Create lookup
    const lookupEl = createLookupElement({
      disabled: true,
      value: SAMPLE_SEARCH_ITEMS[0]
    });

    // Clear selection
    const clearSelButton = lookupEl.shadowRoot.querySelector("button");
    expect(clearSelButton.disabled).toBeTruthy();

    await expect(lookupEl).toBeAccessible();
  });

  it("renders error", async () => {
    const lookupEl = createLookupElement();
    const message = "Sample error";

    lookupEl.setCustomValidity(message);
    lookupEl.reportValidity();

    // Verify error
    await flushPromises();

    const error = lookupEl.shadowRoot.querySelector("[data-field-level-text]");
    expect(error.textContent).toBe(message);

    await expect(lookupEl).toBeAccessible();
  });

  it("renders helptext by default", async () => {
    const props = { fieldLevelText: "some help text" };
    const lookupEl = createLookupElement(props);

    // Verify label
    const helpTextElement =
      lookupEl.shadowRoot.querySelector("lightning-helptext");
    expect(helpTextElement.content).toBe(props.fieldLevelText);

    await expect(lookupEl).toBeAccessible();
  });
});
