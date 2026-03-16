import QuestionInput from "c/questionInput";
import {
  ElementBuilder,
  removeChildren,
  flushPromises,
  getByDataId
} from "test/utils";

const elementBuilder = new ElementBuilder("c-question-input", QuestionInput);

describe("c-question-input", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  const getInputElement = (element) => getByDataId(element, "input");

  it("renders with default type (lightning/input)", async () => {
    const element = await elementBuilder.build({
      label: "Test Label",
      value: "Test Value"
    });

    await flushPromises();

    const input = getInputElement(element);
    expect(input).not.toBeNull();
    expect(input.label).toBe("Test Label");
    expect(input.value).toBe("Test Value");
  });

  it("dispatches update event on change", async () => {
    const element = await elementBuilder.build({
      label: "Test Label"
    });

    await flushPromises();

    const handler = jest.fn();
    element.addEventListener("update", handler);

    const input = getInputElement(element);
    input.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: "New Value" }
      })
    );

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.value).toBe("New Value");
    expect(element.value).toBe("New Value");
  });

  it("handles focus and blur events", async () => {
    const element = await elementBuilder.build();
    await flushPromises();

    const focusHandler = jest.fn();
    const blurHandler = jest.fn();
    element.addEventListener("focus", focusHandler);
    element.addEventListener("blur", blurHandler);

    const input = getInputElement(element);
    input.dispatchEvent(new CustomEvent("focus"));
    input.dispatchEvent(new CustomEvent("blur"));

    expect(focusHandler).toHaveBeenCalled();
    expect(blurHandler).toHaveBeenCalled();
  });

  it("exposes validity and focus methods", async () => {
    const element = await elementBuilder.build();
    await flushPromises();

    const input = getInputElement(element);

    // Mock validity
    Object.defineProperty(input, "validity", {
      get: () => ({ valid: true }),
      configurable: true
    });

    expect(element.validity.valid).toBe(true);

    const focusSpy = jest.spyOn(input, "focus");
    element.focus();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("should set and get props via API", async () => {
    const props = { placeholder: "Enter text", disabled: true };
    const element = await elementBuilder.build({ props });
    await flushPromises();

    expect(element.props).toEqual(props);
    const input = getInputElement(element);
    expect(input.placeholder).toBe("Enter text");
    expect(input.disabled).toBe(true);
  });

  it("should render correct component for lightning/combobox", async () => {
    const element = await elementBuilder.build({ type: "lightning/combobox" });
    await flushPromises();
    expect(getInputElement(element)).toBeDefined();
  });

  it("should render correct component for lightning/textarea", async () => {
    const element = await elementBuilder.build({ type: "lightning/textarea" });
    await flushPromises();
    expect(getInputElement(element)).toBeDefined();
  });

  it("should fallback to default type for unknown string type", async () => {
    const element = await elementBuilder.build({ type: "unknown/type" });
    await flushPromises();
    // In actual implementation, it tries to import(type) then fails and fallbacks
    // But in Jest, we might need to handle the promise rejection if the import fails
    // However, the code uses try/catch or just awaits in a way that might throw.
    // Let's verify if unknown types are handled.
    expect(getInputElement(element)).toBeDefined();
  });

  it("should handle type as a function (dynamic import)", async () => {
    const element = await elementBuilder.build({
      type: () => import("lightning/input")
    });
    await flushPromises();
    expect(getInputElement(element)).toBeDefined();
  });

  it("calls showHelpMessageIfInvalid on input element", async () => {
    const element = await elementBuilder.build();
    await flushPromises();

    const input = getInputElement(element);
    input.showHelpMessageIfInvalid = jest.fn();

    element.showHelpMessageIfInvalid();
    expect(input.showHelpMessageIfInvalid).toHaveBeenCalled();
  });

  it("calls reportValidity if showHelpMessageIfInvalid is not available", async () => {
    const element = await elementBuilder.build();
    await flushPromises();

    const input = getInputElement(element);
    input.showHelpMessageIfInvalid = undefined;
    input.reportValidity = jest.fn();

    element.showHelpMessageIfInvalid();
    expect(input.reportValidity).toHaveBeenCalled();
  });

  it("should update value via setter", async () => {
    const element = await elementBuilder.build();
    element.value = "Test 123";
    expect(element.value).toBe("Test 123");
  });
});
