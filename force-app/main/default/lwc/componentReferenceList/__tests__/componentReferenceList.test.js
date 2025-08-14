import ComponentReferenceList from "c/componentReferenceList";
import { publish } from "c/messageChannelMixin";
import messageChannel from "@salesforce/messageChannel/ComponentReferenceChannel__c";
import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import {
  ElementBuilder,
  getByDataId,
  getAllByDataId,
  removeChildren,
  flushPromises
} from "test/utils";
import COMPONENTS from "./data/components.json";

jest.mock(
  "@salesforce/apex/ComponentReferenceController.getComponents",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

const elementBuilder = new ElementBuilder(
  "c-component-reference-list",
  ComponentReferenceList
);

const mockEvent = (value) =>
  new CustomEvent("change", {
    detail: {
      value
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
    jest.clearAllMocks();
  });

  it("this should show when use quick find and the lenght is greater that expect", async () => {
    element = await elementBuilder.build();
    getComponents.emit(COMPONENTS);

    await flushPromises();

    getInput().dispatchEvent(mockEvent(COMPONENTS[0].DeveloperName));
    await flushPromises();

    const sectionTitle = getSections()[0].label;
    const sectionItem = getSectionItem().label;

    expect(sectionTitle).toBe(COMPONENTS[0].Type__c);
    expect(sectionItem).toBe("c/" + COMPONENTS[0].DeveloperName);
  });

  it("this should show when use quick fiend and the lenght is not greater that expect", async () => {
    element = await elementBuilder.build();
    getComponents.emit(COMPONENTS);

    await flushPromises();
    getInput().dispatchEvent(mockEvent("wizard"));

    await flushPromises();

    expect(getSections().length).toBe(1);
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
        name: COMPONENTS[0].DeveloperName
      }
    });

    getNavegative().dispatchEvent(mock);
    await flushPromises();

    expect(publish).toHaveBeenCalledWith({
      channel: messageChannel,
      payload: { descriptor: COMPONENTS[0].DeveloperName }
    });
  });
});
