import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import FormattedFile from "c/formattedFile";
import getFile from "@salesforce/apex/FormattedFileController.getFile";
import {
  ElementBuilder,
  removeChildren,
  getByDataId,
  flushPromises
} from "test/utils";

// Register the wire adapter for the Apex method
const getFileWireAdapter = registerApexTestWireAdapter(getFile);

const elementBuilder = new ElementBuilder("c-formatted-file", FormattedFile);

const MOCK_FILE = {
  id: "001",
  name: "Test File",
  extension: "pdf",
  size: 102400,
  latestVersionId: "v1",
  lastModifiedDate: "2026-03-20T12:00:00Z"
};

describe("c-formatted-file", () => {
  let element;

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should render file when data is returned", async () => {
    element = await elementBuilder.build({ contentDocumentId: "001" });

    // Emit data from the wire adapter
    getFileWireAdapter.emit(MOCK_FILE);

    // Wait for DOM updates
    await flushPromises();

    const fileLink = getByDataId(element, "file-link");
    expect(fileLink.textContent).toBe("Test File");
    expect(fileLink.href).toContain("001");

    const fileMeta = getByDataId(element, "file-meta");
    expect(fileMeta.textContent).toContain("Mar 20, 2026");
    expect(fileMeta.textContent).toContain("100KB");
    expect(fileMeta.textContent).toContain("pdf");

    // Verify accessibility
    await expect(element).toBeAccessible();
  });

  it("should render file with override name when provided", async () => {
    element = await elementBuilder.build({
      contentDocumentId: "001",
      name: "Override Name"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const fileLink = getByDataId(element, "file-link");
    expect(fileLink.textContent).toBe("Override Name");
  });

  it("should render fallback icon when no thumbnail is available", async () => {
    const noThumbFile = {
      ...MOCK_FILE,
      latestVersionId: null
    };
    element = await elementBuilder.build({ contentDocumentId: "001" });

    getFileWireAdapter.emit(noThumbFile);
    await flushPromises();

    const icon = getByDataId(element, "file-icon");
    expect(icon).toBeTruthy();
    expect(icon.iconName).toBe("doctype:pdf");
  });

  it("should render icon instead of image when hidePreview is true", async () => {
    element = await elementBuilder.build({
      contentDocumentId: "001",
      hidePreview: true
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const icon = getByDataId(element, "file-icon");
    const img = getByDataId(element, "file-img");

    expect(icon).toBeTruthy();
    expect(img).toBeNull();
    expect(icon.iconName).toBe("doctype:pdf");
  });

  it("should render correct icon based on extension", async () => {
    const excelFile = {
      ...MOCK_FILE,
      extension: "xlsx",
      latestVersionId: null
    };
    element = await elementBuilder.build({ contentDocumentId: "001" });

    getFileWireAdapter.emit(excelFile);
    await flushPromises();

    const icon = getByDataId(element, "file-icon");
    expect(icon.iconName).toBe("doctype:excel");
  });

  it("should render image by default when thumbnail is available", async () => {
    element = await elementBuilder.build({ contentDocumentId: "001" });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const img = getByDataId(element, "file-img");
    expect(img).toBeTruthy();
    expect(img.src).toContain("renditionDownload");
  });
});
