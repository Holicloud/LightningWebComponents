import ComponentReferenceHeader, {
  BASE_INFO
} from "c/componentReferenceHeader";
import {
  ElementBuilder,
  resetDOM,
  addToDOM,
  flushPromises,
  removeFromDOM,
  getByDataId
} from "test/utils";
import { publish, isSubscribed } from "c/messageChannelMixin";
import messageChannel from "@salesforce/messageChannel/ComponentReference__c";
import { HEADER_INFO, COMPONENTS } from "c/componentReference";

jest.mock("c/messageChannelMixin");

describe("c-component-reference-header", () => {
  const elementBuilder = new ElementBuilder(
    "c-component-reference-header",
    ComponentReferenceHeader
  );

  afterEach(() => {
    resetDOM();
  });

  it("should sub/unsub", async () => {
    const element = elementBuilder.build();
    addToDOM(element);

    expect(isSubscribed(messageChannel)).toBe(true);

    removeFromDOM(element);

    expect(isSubscribed(messageChannel)).toBe(false);
  });

  it("should display header info from first component", async () => {
    const element = elementBuilder.build();
    addToDOM(element);

    expect(getByDataId(element, "description").textContent).toBe(
      BASE_INFO.description
    );
    expect(getByDataId(element, "title").textContent).toBe(BASE_INFO.title);
    expect(getByDataId(element, "descriptor").textContent).toBe(
      BASE_INFO.descriptor
    );
    const targets = element.shadowRoot.querySelectorAll('[data-id="target"]');
    expect(targets.length).toBe(BASE_INFO.targets.length);
    expect(targets[0].textContent).toBe(BASE_INFO.targets[0]);
  });

  it("should display header info when changed component", async () => {
    const element = elementBuilder.build();
    addToDOM(element);

    publish({
      channel: messageChannel,
      payload: {
        descriptor: COMPONENTS.C_ALERT.descriptor
      }
    });

    const headerInfo = HEADER_INFO[COMPONENTS.C_ALERT.descriptor];

    await flushPromises();

    expect(getByDataId(element, "description").textContent).toBe(
      headerInfo.description
    );
    expect(getByDataId(element, "title").textContent).toBe(headerInfo.title);
    expect(getByDataId(element, "descriptor").textContent).toBe(
      headerInfo.descriptor
    );
    const targets = element.shadowRoot.querySelectorAll('[data-id="target"]');
    expect(targets.length).toBe(headerInfo.targets.length);
    expect(targets[0].textContent).toBe(headerInfo.targets[0]);
  });
});
