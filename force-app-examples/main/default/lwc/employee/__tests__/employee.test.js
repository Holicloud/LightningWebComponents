import Employee, { LABELS } from "c/employee";
import {
  removeChildren,
  ElementBuilder,
  getByDataId,
  flushPromises,
  createMockedEventListener
} from "test/utils";
import { clone } from "c/utils";
import LightningConfirm from "lightning/confirm";
import RECORD from "./data/records.json";

const elementBuilder = new ElementBuilder("c-employee", Employee).setConfig({
  defaultApiProps: {
    record: RECORD
  }
});

const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
jest.mock("c/panel");
jest.mock("c/employeeDependent");

describe("c-employee", () => {
  let element;

  const getPanel = () => getByDataId(element, "panel");
  const getRemoveButton = () => getByDataId(element, "remove");
  const getAddDependentButton = () => getByDataId(element, "add-dependent");
  const getDependents = () => [
    ...element.shadowRoot.querySelectorAll("[data-dependent-id]")
  ];
  const getFirstName = () =>
    element.shadowRoot.querySelector('[data-input="firstName"]');
  // const getGender = () => element.shadowRoot.querySelector('[data-input="gender"]');

  afterEach(() => {
    removeChildren();
    scrollIntoViewMock.mockReset();
  });

  it("should be invalid when more than one spouse", async () => {
    const record = clone(RECORD);
    record.dependents[0].relationship = "Spouse";
    record.dependents[1].relationship = "Spouse";

    element = await elementBuilder.build({ record });

    const panel = getPanel();
    panel.reportValidity = jest.fn().mockReturnValue(true);
    panel.setCustomValidity = jest.fn().mockReturnValue(true);

    element.reportValidity();

    expect(panel.reportValidity).toHaveBeenCalled();
    expect(panel.setCustomValidity).toHaveBeenCalledWith(
      LABELS.errors.invalidNumberOfSpouses,
      undefined
    );

    element.record.dependents[1].relationship = "Child";

    expect(element.reportValidity()).toBeTruthy();
    expect(panel.reportValidity).toHaveBeenCalled();
    expect(panel.setCustomValidity).toHaveBeenCalledWith("", undefined);
  });

  it("should check validity", async () => {
    element = await elementBuilder.build();

    const panel = getPanel();
    panel.reportValidity = jest.fn().mockReturnValue(true);
    panel.checkValidity = jest.fn().mockReturnValue(true);

    expect(element.checkValidity()).toBe(true);
  });

  it("should set custom validity", async () => {
    element = await elementBuilder.build();

    const panel = getPanel();
    panel.reportValidity = jest.fn().mockReturnValue(true);
    panel.checkValidity = jest.fn().mockReturnValue(true);

    element.setCustomValidity("error");

    expect(panel.setCustomValidity).toHaveBeenCalled();
  });

  it("should scroll to component in error", async () => {
    element = await elementBuilder.build();

    const panel = getPanel();
    panel.reportValidity = jest.fn().mockReturnValue(false);
    panel.checkValidity = jest.fn().mockReturnValue(false);

    element.scrollInViewOnError();
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it("should scroll to dependent in error", async () => {
    element = await elementBuilder.build();

    const panel = getPanel();
    panel.reportValidity = jest.fn().mockReturnValue(true);
    panel.checkValidity = jest.fn().mockReturnValue(true);

    const dependents = getDependents();
    expect(dependents.length).toBeGreaterThan(0);

    dependents[0].checkValidity = jest.fn().mockReturnValue(false);

    element.scrollInViewOnError();
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it("should trigger change event when input changes", async () => {
    element = await elementBuilder.build();
    const changeEvent = createMockedEventListener(element, "update");

    const input = getFirstName();
    input.value = "new Name";
    input.dispatchEvent(new CustomEvent("change"));

    await flushPromises();

    expect(element.record.firstName).toBe(input.value);
    expect(changeEvent).toHaveBeenCalled();
  });

  it("should send remove event", async () => {
    element = await elementBuilder.build({
      record: undefined
    });
    const removeEvent = createMockedEventListener(element, "remove");

    const remove = getRemoveButton();
    remove.dispatchEvent(new CustomEvent("click"));
    await flushPromises();
    expect(removeEvent).toHaveBeenCalled();

    element.record = RECORD;
    LightningConfirm.open = jest.fn().mockResolvedValue(true);
    remove.dispatchEvent(new CustomEvent("click"));

    await flushPromises();
    expect(removeEvent).toHaveBeenCalled();
  });

  it("should add dependent", async () => {
    element = await elementBuilder.build();
    const updateEvent = createMockedEventListener(element, "update");

    const addDependent = getAddDependentButton();
    addDependent.dispatchEvent(new CustomEvent("click"));

    await flushPromises();
    expect(updateEvent).toHaveBeenCalled();
    expect(element.record.dependents.length).toBe(3);
  });

  it("should notify dependent update", async () => {
    element = await elementBuilder.build();
    const updateEvent = createMockedEventListener(element, "update");

    getDependents()[0].dispatchEvent(
      new CustomEvent("update", {
        detail: {
          record: {
            status: "inactive"
          }
        }
      })
    );
    await flushPromises();
    expect(updateEvent).toHaveBeenCalled();
    expect(element.record.dependents[0].status).toBe("inactive");
  });

  it("should remove dependent and notify update", async () => {
    element = await elementBuilder.build();
    const updateEvent = createMockedEventListener(element, "update");

    getDependents()[0].dispatchEvent(new CustomEvent("remove"));
    await flushPromises();
    expect(updateEvent).toHaveBeenCalled();
    expect(element.record.dependents.length).toBe(1);
  });
});
