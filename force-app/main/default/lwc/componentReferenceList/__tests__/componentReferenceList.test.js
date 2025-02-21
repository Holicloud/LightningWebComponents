import ComponentReferenceList from "c/componentReferenceList";
import { COMPONENTS, COMPONENT_TYPES } from "c/componentReference";
import { publish } from "c/messageChannelMixin";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import {
  ElementBuilder,
  getByDataId,
  getAllByDataId,
  removeChildren,
  flushPromises
} from "test/utils";

const COMPONENT = Object.freeze(Object.values(COMPONENTS)[1]);
const elementBuilder = new ElementBuilder(
  "c-component-reference-list",
  ComponentReferenceList
);

const mockEvent = (value) =>
  new CustomEvent("change", {
    detail: {
      value: value
    }
  });

jest.mock("c/messageChannelMixin");

describe("c-component-reference-list", () => {
  let element;

  const getInput = () => getByDataId(element, "input");
  const getSectionItem = () => getByDataId(element, "item");
  const getSections = () => getAllByDataId(element, "section");
  const getNavegative = () => getByDataId(element, "navigate");

  afterEach(() => {
    removeChildren();
  });

  it("this should show when use quick find and the lenght is greater that expect", async () => {
    element = await elementBuilder.build();

    getInput().dispatchEvent(mockEvent(COMPONENT.descriptor));
    await flushPromises();

    const sectionTitle = getSections()[0].label;
    const sectionItem = getSectionItem().label;

    expect(sectionTitle).toBe(COMPONENT.type);
    expect(sectionItem).toBe(COMPONENT.descriptor);
  });

  it("this should show when use quick fiend and the lenght is not greater that expect", async () => {
    element = await elementBuilder.build();
    getInput().dispatchEvent(mockEvent("al"));

    await flushPromises();

    expect(getSections().length).toBe(Object.values(COMPONENT_TYPES).length);
  });

  it("this should not display anything component", async () => {
    element = await elementBuilder.build();
    getInput().dispatchEvent(mockEvent("aaa"));

    await flushPromises();

    expect(getSections().length).toBeFalsy();
  });

  it("should publish when item is selected", async () => {
    element = await elementBuilder.build();

    const mock = new CustomEvent("select", {
      detail: {
        name: COMPONENT.descriptor
      }
    });

    getNavegative().dispatchEvent(mock);
    await flushPromises();

    expect(publish).toHaveBeenCalledWith({
      channel: componentReference,
      payload: { descriptor: COMPONENT.descriptor }
    });
  });
});
