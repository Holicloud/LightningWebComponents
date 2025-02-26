import LookupSubtitle, { COMPONENTS } from "c/lookupSubtitle";
import {
  ElementBuilder,
  getByDataId,
  removeChildren,
  flushPromises
} from "test/utils";

const elementBuilder = new ElementBuilder("c-lookup-subtitle", LookupSubtitle);

describe("c-lookup-subtitle", () => {
  let element;

  const getComponent = () => getByDataId(element, element.type);
  afterEach(() => {
    removeChildren();
  });

  it("this should display when overwrite the properties", async () => {
    element = await elementBuilder.build({
      type: "lightning/icon",
      props: { iconName: "standard:account", size: "small" }
    });

    let component = getComponent();
    expect(component?.dataset.id).toBe(element.type);

    for await (const type of Object.keys(COMPONENTS)) {
      element = await elementBuilder.build({
        type
      });
      await flushPromises();
      component = getComponent();
      expect(component?.dataset.id).toBe(element.type);
    }
  });

  it("this should display when the property is not in data", async () => {
    element = await elementBuilder.build({ type: "lightning/button" });

    expect(getComponent()?.dataset.id).toBe(element.type);
  });

  it("should merge baseProps and props correctly", async () => {
    element = await elementBuilder.build({
      type: "lightning/icon",
      props: { iconName: "standard:account", size: "small" }
    });
    await flushPromises();
    const component = getComponent();
    expect(component?.dataset.id).toBe(element.type);
    expect(component.iconName).toBe("standard:account");
    expect(component.size).toBe("small");
  });

  it("should handle empty props", async () => {
    element = await elementBuilder.build({ type: "lightning/formattedText" });
    await flushPromises();
    const component = getComponent();
    expect(component?.dataset.id).toBe(element.type);
  });
});
