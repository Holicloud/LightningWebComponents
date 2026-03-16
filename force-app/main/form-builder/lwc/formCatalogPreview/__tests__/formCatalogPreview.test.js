import FormCatalogPreview from "c/formCatalogPreview";
import { ElementBuilder, removeChildren, flushPromises } from "test/utils";

const elementBuilder = new ElementBuilder(
  "c-form-catalog-preview",
  FormCatalogPreview
);

jest.mock("c/questionCatalog");

describe("c-form-catalog-preview", () => {
  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("renders with correct props (mocking child catalog)", async () => {
    const element = await elementBuilder.build({
      recordId: "fd001",
      section: "Section 1",
      editable: true
    });

    await flushPromises();

    // Since we are not mocking the component itself, it rendered c-question-catalog
    // We can just verify it's there and has props
    const catalog = element.shadowRoot.querySelector("c-question-catalog");
    expect(catalog).not.toBeNull();
    expect(catalog.formDefinitionId).toBe("fd001");
  });
});
