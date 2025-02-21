import LookupSubtitle from "c/lookupSubtitle";
import { ElementBuilder, getByDataId, removeChildren } from "test/utils";

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

    const component = getComponent();
    expect(component?.iconName).toBe(element.props.iconName);
    expect(component?.dataset.id).toBe(element.type);
  });

  it("this should display when the property is not in data", async () => {
    element = await elementBuilder.build({ type: "lightning/button" });

    expect(getComponent()?.dataset.id).toBe(element.type);
  });
});
