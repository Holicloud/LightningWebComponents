import ComponentExample, { INVERSE_VARIANT } from "c/componentExample";
import { ElementBuilder, getByDataId, removeChildren } from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-component-example",
  ComponentExample
);
describe("c-component-example", () => {
  let element;

  const getBodyClass = () => getByDataId(element, "body");
  afterEach(() => {
    removeChildren();
  });

  it("This show if is default values", async () => {
    element = await elementBuilder.build();

    expect(getBodyClass().classList).toContain("lgc-bg");
  });

  it("This shows if it is variant", async () => {
    element = await elementBuilder.build({ variant: INVERSE_VARIANT });

    expect(getBodyClass().classList).toContain("lgc-bg-inverse");
  });
});
