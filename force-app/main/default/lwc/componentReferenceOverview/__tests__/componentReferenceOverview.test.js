import ComponentReferenceOverview from "c/componentReferenceOverview";
import messageChannel from "@salesforce/messageChannel/ComponentReferenceChannel__c";
import { publish } from "c/messageChannelMixin";
import { getNavigateCalledWith } from "lightning/navigation";
import getExamples from "@salesforce/apex/ComponentReferenceController.getExamples";
import getComponents from "@salesforce/apex/ComponentReferenceController.getComponents";
import {
  ElementBuilder,
  getByDataId,
  removeChildren,
  flushPromises
} from "test/utils";

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

jest.mock(
  "@salesforce/apex/ComponentReferenceController.getExamples",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);

import COMPONENTS from "./data/components.json";
import EXAMPLES from "./data/examples.json";

const [FIRST_EXAMPLE, SECOND_EXAMPLE] = Object.freeze(Object.values(EXAMPLES));
const elementBuilder = new ElementBuilder(
  "c-component-reference-overview",
  ComponentReferenceOverview
);

jest.mock("c/messageChannelMixin");

describe("c-component-reference-overview", () => {
  let element;

  const getDescription = () => getByDataId(element, "description");
  const getExample = () => getByDataId(element, "example");
  const getViewInGitButton = () => getByDataId(element, "view-in-git");

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("this should display the example", async () => {
    element = await elementBuilder.build();

    getExamples.mockResolvedValue(EXAMPLES);
    getComponents.emit(COMPONENTS);

    await flushPromises();

    publish({
      channel: messageChannel,
      payload: { descriptor: COMPONENTS[0].DeveloperName }
    });

    await flushPromises();
    const example = getExample();
    expect(example.options[0].value).toBe(FIRST_EXAMPLE.DeveloperName);
    expect(example.value).toBe(FIRST_EXAMPLE.DeveloperName);
    expect(getDescription().textContent).toBe(FIRST_EXAMPLE.Description__c);

    const mockEvent = new CustomEvent("change", {
      detail: {
        value: SECOND_EXAMPLE.DeveloperName
      }
    });

    example.dispatchEvent(mockEvent);
    await flushPromises();

    expect(getExample().value).toBe(SECOND_EXAMPLE.DeveloperName);

    getViewInGitButton().click();
    const { pageReference } = getNavigateCalledWith();
    expect(pageReference.type).toBe("standard__webPage");
    expect(pageReference.attributes.url).not.toBeFalsy();

    const title =
      element.shadowRoot.querySelector("[data-component]").dataset.component;
    expect(title).toBe(SECOND_EXAMPLE.DeveloperName);
  });
});
