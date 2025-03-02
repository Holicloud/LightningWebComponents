import ComponentReferenceOverview from "c/componentReferenceOverview";
import componentReference from "@salesforce/messageChannel/ComponentReference__c";
import { publish } from "c/messageChannelMixin";
import { getNavigateCalledWith } from "lightning/navigation";
import { EXAMPLES, COMPONENTS } from "c/componentReference";
import {
  ElementBuilder,
  getByDataId,
  removeChildren,
  flushPromises
} from "test/utils";

const [FIRST_EXAMPLE, SECOND_EXAMPLE] = Object.freeze(
  Object.values(EXAMPLES)[1]
);
const COMPONENT = Object.freeze(Object.values(COMPONENTS)[1]);
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
  });

  it("this should display the example", async () => {
    element = await elementBuilder.build();

    publish({
      channel: componentReference,
      payload: { descriptor: COMPONENT.descriptor }
    });

    await flushPromises();
    const example = getExample();
    expect(example.options[0].value).toBe(FIRST_EXAMPLE.title);
    expect(example.value).toBe(FIRST_EXAMPLE.title);
    expect(getDescription().textContent).toBe(FIRST_EXAMPLE.description);

    const mockEvent = new CustomEvent("change", {
      detail: {
        value: SECOND_EXAMPLE.title
      }
    });

    example.dispatchEvent(mockEvent);
    await flushPromises();

    expect(getExample().value).toBe(SECOND_EXAMPLE.title);

    getViewInGitButton().click();
    const { pageReference } = getNavigateCalledWith();
    expect(pageReference.type).toBe("standard__webPage");
    expect(pageReference.attributes.url).toBe(SECOND_EXAMPLE.git);

    const title =
      element.shadowRoot.querySelector("[data-component]").dataset.component;
    expect(title).toBe(SECOND_EXAMPLE.title);
  });
});
