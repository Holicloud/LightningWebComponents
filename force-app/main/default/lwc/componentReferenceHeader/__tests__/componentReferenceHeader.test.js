import ComponentReferenceHeader from "c/componentReferenceHeader";
import { ElementBuilder, flushPromises, resetDOM, getByDataId, addToDOM } from "test/utils";
import { HEADER_INFO, COMPONENTS } from "c/componentReference"

// import { MessageChannelMixin } from 'c/messageChannelMixin';
// jest.mock('c/messageChannelMixin');

describe("c-component-reference-header", () => {
  const elementBuilder = new ElementBuilder(
    "c-component-reference-header",
    ComponentReferenceHeader
  );

  const firstComponent = HEADER_INFO[Object.values(COMPONENTS)[0]];

  afterEach(() => {
    resetDOM();
  });

  it("should display first component as default", async () => {
    const element = elementBuilder.build();
    addToDOM(element);

    await flushPromises();

    expect(getByDataId(element, "description")?.textContent).toBe(firstComponent.description);
  });
});