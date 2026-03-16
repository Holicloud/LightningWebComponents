import MultiSelectCheckbox from "c/multiSelectCheckbox";
import { ElementBuilder, removeChildren, flushPromises } from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-multi-select-checkbox",
  MultiSelectCheckbox
);

const MOCK_OPTIONS = [
  { label: "Option 1", value: "opt1" },
  { label: "Option 2", value: "opt2" },
  { label: "Option 3", value: "opt3" }
];

describe("c-multi-select-checkbox", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("renders the provided options", async () => {
    const element = await elementBuilder.build({
      options: MOCK_OPTIONS
    });

    await flushPromises();

    const checkboxes = element.shadowRoot.querySelectorAll("lightning-input");
    expect(checkboxes.length).toBe(MOCK_OPTIONS.length);

    MOCK_OPTIONS.forEach((option, index) => {
      expect(checkboxes[index].label).toBe(option.label);
    });
  });

  it("renders correctly with empty options", async () => {
    const element = await elementBuilder.build({
      options: []
    });

    await flushPromises();

    const checkboxes = element.shadowRoot.querySelectorAll("lightning-input");
    expect(checkboxes.length).toBe(0);
  });
});
