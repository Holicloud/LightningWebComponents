import ComponentReferenceHeader from "c/componentReferenceHeader";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { HEADER_INFO } from "c/componentReference";
import { publish, isSubscribed } from "c/messageChannelMixin";
import { getNavigateCalledWith } from "lightning/navigation";
import {
  ElementBuilder,
  getByDataId,
  removeChildren,
  flushPromises
} from "test/utils";

const HEADER = Object.freeze(Object.values(HEADER_INFO));
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
  });

  it("should navigate to git page", async () => {
    element = await elementBuilder.build();
    getViewInGitButton().click();

    const { pageReference } = getNavigateCalledWith();
    expect(pageReference.type).toBe("standard__webPage");
    expect(pageReference.attributes.url).toBe(HEADER[0].git);
  });

  it("should display default info", async () => {
    element = await elementBuilder.build();

    const firstComponent = HEADER[0];
    expect(isSubscribed(componentReference)).toBe(true);
    expect(getDescription().textContent).toContain(firstComponent.description);
    expect(getDescriptor().textContent).toContain(firstComponent.descriptor);
    expect(getTarget().textContent).toContain(firstComponent.targets[0]);
  });

  it("when the component changes should display the respective info", async () => {
    element = await elementBuilder.build();

    const anotherComponent = HEADER[1];
    publish({
      channel: componentReference,
      payload: { descriptor: anotherComponent.descriptor }
    });

    await flushPromises();

    expect(getDescription().textContent).toContain(
      anotherComponent.description
    );
    expect(getDescriptor().textContent).toContain(anotherComponent.descriptor);
    expect(getTarget().textContent).toContain(anotherComponent.targets[0]);
  });
});
