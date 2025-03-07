import EmployeeDependent from "c/employeeDependent";
import {
  ElementBuilder,
  getByDataId,
  removeChildren,
  createMockedEventListener
} from "test/utils";

jest.mock("c/panel");

const elementBuilder = new ElementBuilder(
  "c-employee-dependent",
  EmployeeDependent
);
describe("c-employee-dependent", () => {
  let element;

  const getPanel = () => getByDataId(element, "panel");
  const getRemoveButton = () => getByDataId(element, "remove");
  const getFirstName = () =>
    element.shadowRoot.querySelector('[data-input="firstName"]');

  afterEach(() => {
    removeChildren();
  });
  it("should report validity", async () => {
    element = await elementBuilder.build();

    element.reportValidity();

    expect(getPanel().reportValidity).toHaveBeenCalled();
  });
  it("should check validity", async () => {
    element = await elementBuilder.build();

    element.checkValidity();

    expect(getPanel().checkValidity).toHaveBeenCalled();
  });

  it("should set custom validity", async () => {
    element = await elementBuilder.build();

    element.setCustomValidity("error");

    expect(getPanel().setCustomValidity).toHaveBeenCalled();
  });

  it("should notify update", async () => {
    element = await elementBuilder.build();
    const changeEvent = createMockedEventListener(element, "update");

    const input = getFirstName();
    input.value = "new Name";
    input.dispatchEvent(new CustomEvent("change"));

    expect(element.record.firstName).toBe(input.value);
    expect(changeEvent).toHaveBeenCalled();
  });

  it("should notify remove", async () => {
    element = await elementBuilder.build();
    const removeEvent = createMockedEventListener(element, "remove");

    getRemoveButton().dispatchEvent(new CustomEvent("click"));

    expect(removeEvent).toHaveBeenCalled();
  });
});
