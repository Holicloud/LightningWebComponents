import DatatablePlusDynamicCell from "c/datatablePlusDynamicCell";
import { ElementBuilder } from "test/utils";
import { removeChildren, getByDataId } from "test/utils";

const builder = new ElementBuilder(
  "c-datatable-plus-dynamic-cell",
  DatatablePlusDynamicCell
);

jest.mock("c/record");

describe("c-datatable-plus-dynamic-cell", () => {
  let element;

  const getOutputElement = () => getByDataId(element, "output");

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should set and get value via API", async () => {
    element = await builder.build();
    element.value = "testValue";
    expect(element.value).toBe("testValue");
  });

  it("should set and get type via API", async () => {
    element = await builder.build();
    element.type = "lightning/formattedText";
    expect(getOutputElement()).toBeDefined();
  });

  it("should set default type when given is null", async () => {
    element = await builder.build();
    element.type = null;
    expect(getOutputElement()).toBeDefined();
  });

  it("should set and get props via API", async () => {
    element = await builder.build();
    element.props = { label: "Test Label" };
    expect(element.props).toEqual({ label: "Test Label" });
  });

  it("should render the correct component for setType (cached)", async () => {
    element = await builder.build({ type: "lightning/formattedDateTime" });
    expect(getOutputElement()).toBeDefined();
  });

  it("should render the correct component formattedEmail", async () => {
    element = await builder.build({ type: "lightning/formattedEmail" });
    expect(getOutputElement()).toBeDefined();
  });

  it("should render the correct component formattedNumber", async () => {
    element = await builder.build({ type: "lightning/formattedNumber" });
    expect(getOutputElement()).toBeDefined();
  });

  it("should render the correct component for type", async () => {
    element = await builder.build({ type: "lightning/formattedUrl" });
    expect(getOutputElement()).toBeDefined();
  });

  it("should render the correct component for setType (uncached)", async () => {
    element = await builder.build({ type: "c/record" });
    expect(getOutputElement()).toBeDefined();
  });

  it("should render the correct component for setType (import function)", async () => {
    element = await builder.build({ type: () => import("c/record") });
    expect(getOutputElement()).toBeDefined();
  });
});
