import ComponentReferenceHeader from "c/componentReferenceHeader";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { publish, isSubscribed } from "c/messageChannelMixin";
import { getNavigateCalledWith } from "lightning/navigation";
import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import {
  ElementBuilder,
  getByDataId,
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
  "c-component-reference-header",
  ComponentReferenceHeader
);

jest.mock("c/messageChannelMixin");

describe("c-component-reference-header", () => {
  let element;

  const getViewInGitButton = () => getByDataId(element, "view-in-git");
  const getDescription = () => getByDataId(element, "description");
  const getDescriptor = () => getByDataId(element, "descriptor");
  const getTarget = () => getByDataId(element, "target");
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should navigate to git page", async () => {
    element = await elementBuilder.build();
    getComponents.emit(COMPONENTS);

    await flushPromises();

    getViewInGitButton().click();

    const { pageReference } = getNavigateCalledWith();
    expect(pageReference.type).toBe("standard__webPage");
    expect(pageReference.attributes.url).not.toBeFalsy();
  });

  it("should display default info", async () => {
    element = await elementBuilder.build();
    getComponents.emit(COMPONENTS);

    await flushPromises();

    const firstComponent = COMPONENTS[0];
    expect(isSubscribed(componentReference)).toBe(true);
    expect(getDescription().textContent).toContain(
      firstComponent.Description__c
    );
    expect(getDescriptor().textContent).toContain(firstComponent.DeveloperName);
    expect(getTarget().textContent).toContain(firstComponent.Targets__c);
  });

  it("when the component changes should display the respective info", async () => {
    element = await elementBuilder.build();
    getComponents.emit(COMPONENTS);

    await flushPromises();

    const anotherComponent = COMPONENTS[1];
    publish({
      channel: componentReference,
      payload: { descriptor: anotherComponent.DeveloperName }
    });

    await flushPromises();

    expect(getDescription().textContent).toContain(
      anotherComponent.Description__c
    );
    expect(getDescriptor().textContent).toContain(
      anotherComponent.DeveloperName
    );
    expect(getTarget().textContent).toContain(anotherComponent.Targets__c);
  });
});
