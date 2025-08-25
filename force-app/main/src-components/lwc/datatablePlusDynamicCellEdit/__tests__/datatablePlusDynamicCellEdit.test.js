import DatatablePlusDynamicCellEdit from "c/datatablePlusDynamicCellEdit";
import { ElementBuilder, flushPromises } from "test/utils";
import {
  removeChildren,
  getByDataId,
  createMockedEventListener
} from "test/utils";

const builder = new ElementBuilder(
  "c-datatable-plus-dynamic-cell-edit",
  DatatablePlusDynamicCellEdit
);
jest.mock("c/wizard");
jest.mock("c/lookup");

describe("c-datatable-plus-dynamic-cell-edit", () => {
  let element;
  const getInputElement = () => getByDataId(element, "input");

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should set and get value via API", async () => {
    element = await builder.build();
    element.value = "testValue";
    expect(element.value).toBe("testValue");
  });

  it("should render default component", async () => {
    element = await builder.build();
    expect(element.type).toBe("lightning/input");
  });

  it("should render cached component", async () => {
    element = await builder.build({
      type: "lightning/combobox"
    });
    await flushPromises();
    expect(getInputElement()).toBeDefined();
    expect(element.type).toBe("lightning/combobox");
  });

  it("should render from import function", async () => {
    element = await builder.build({
      type: () => import("c/wizard")
    });
    await flushPromises();
    expect(getInputElement()).toBeDefined();
  });

  it("should render uncached from string", async () => {
    element = await builder.build({
      type: "c/wizard"
    });
    await flushPromises();
    expect(getInputElement()).toBeDefined();
  });

  it("should clear input on lookup if scape of backspace", async () => {
    element = await builder.build({
      type: "c/lookup"
    });

    const container = getByDataId(element, "container");
    const lookupText = getByDataId(element, "lookup-message");
    container.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 8 }));
    expect(lookupText.textContent).toBeDefined();
    expect(element.value).toBeNull();
  });

  it("should render with the actual constructor", async () => {
    const { default: ctor } = await import("c/wizard");
    element = await builder.build({
      type: ctor
    });
    await flushPromises();
    expect(getInputElement()).toBeDefined();
  });

  it("should set and get props via API", async () => {
    element = await builder.build();
    element.props = { label: "Test Label" };
    expect(element.props).toEqual({ label: "Test Label" });
  });

  it("should call focus on inputElement", async () => {
    element = await builder.build();
    const input = getInputElement();
    input.focus = createMockedEventListener(input, "focus");
    element.focus();
    expect(input.focus).toHaveBeenCalled();
  });

  it("should call showHelpMessageIfInvalid on inputElement", async () => {
    element = await builder.build();
    const input = getInputElement();
    input.showHelpMessageIfInvalid = createMockedEventListener(
      input,
      "showHelpMessageIfInvalid"
    );
    element.showHelpMessageIfInvalid();
    expect(input.showHelpMessageIfInvalid).toHaveBeenCalled();
  });

  it("should call reportValidity if no showHelpMessageIfInvalid", async () => {
    element = await builder.build();
    const input = getInputElement();
    input.showHelpMessageIfInvalid = null;
    input.reportValidity = createMockedEventListener(input, "reportValidity");
    element.showHelpMessageIfInvalid();
    expect(input.reportValidity).toHaveBeenCalled();
  });

  it("should call validity on recordPicker", async () => {
    element = await builder.build({
      type: "lightning/recordPicker"
    });
    const input = getInputElement();
    input.checkValidity = createMockedEventListener(
      input,
      "checkValidity",
      () => true
    );
    expect(element.validity).toEqual({ valid: true });
    expect(input.checkValidity).toHaveBeenCalled();
  });

  it("should dispatch change event", async () => {
    element = await builder.build();
    const changeEvent = createMockedEventListener(element, "change");
    const input = getInputElement();
    input.dispatchEvent(
      new CustomEvent("change", { detail: { value: "testValue" } })
    );
    expect(changeEvent).toHaveBeenCalled();
  });

  it("should dispatch focus event", async () => {
    element = await builder.build();
    const focusEvent = createMockedEventListener(element, "focus");
    const input = getInputElement();
    input.dispatchEvent(new CustomEvent("focus"));
    expect(focusEvent).toHaveBeenCalled();
  });

  it("should dispatch blur event", async () => {
    element = await builder.build();
    const blurEvent = createMockedEventListener(element, "blur");
    const input = getInputElement();
    input.dispatchEvent(new CustomEvent("blur"));
    expect(blurEvent).toHaveBeenCalled();
  });

  it("should call validity on inputElement", async () => {
    element = await builder.build();
    const input = getInputElement();
    input.validity = { valid: true };
    expect(element.validity).toEqual(input.validity);
  });
});
