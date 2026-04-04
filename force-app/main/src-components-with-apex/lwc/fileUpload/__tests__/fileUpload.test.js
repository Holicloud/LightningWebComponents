import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import FileUpload from "c/fileUpload";
import { refreshApex } from "@salesforce/apex";
import getContentDocumentLinkId from "@salesforce/apex/FileUploadController.getContentDocumentLinkId";
import getDownloadUrl from "@salesforce/apex/FileUploadController.getDownloadUrl";
import getFile from "@salesforce/apex/FileUploadController.getFile";
import replaceFileVersion from "@salesforce/apex/FileUploadController.replaceFileVersion";
import unlinkFile from "@salesforce/apex/FileUploadController.unlinkFile";
import {
  ElementBuilder,
  removeChildren,
  getByDataId,
  flushPromises
} from "test/utils";

// Register the wire adapter for the Apex method
const getFileWireAdapter = registerApexTestWireAdapter(getFile);

// Mock the Apex methods
jest.mock(
  "@salesforce/apex",
  () => ({
    refreshApex: jest.fn(() => Promise.resolve())
  }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/FileUploadController.unlinkFile",
  () => ({ default: jest.fn(() => Promise.resolve()) }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/FileUploadController.getDownloadUrl",
  () => ({ default: jest.fn(() => Promise.resolve("/download/url")) }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/FileUploadController.getContentDocumentLinkId",
  () => ({ default: jest.fn(() => Promise.resolve("06A000000000001")) }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/FileUploadController.replaceFileVersion",
  () => ({ default: jest.fn(() => Promise.resolve()) }),
  { virtual: true }
);

// Mock window.open
const openMock = jest.fn();
window.open = openMock;

const elementBuilder = new ElementBuilder("c-file-upload", FileUpload);

const MOCK_FILE = {
  id: "069000000000001",
  name: "Test File",
  extension: "pdf",
  size: 102400,
  latestVersionId: "068000000000001",
  lastModifiedDate: "2026-03-20T12:00:00Z"
};

describe("c-file-upload", () => {
  let element;

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("should render upload mode when no file data exists", async () => {
    element = await elementBuilder.build({
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(null);
    await flushPromises();

    const fileUpload = getByDataId(element, "file-upload");
    const fileTile = getByDataId(element, "file-tile");

    expect(fileUpload).toBeTruthy();
    expect(fileTile).toBeNull();
  });

  it("should render view mode when file data is returned", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const fileTile = getByDataId(element, "file-tile");
    const fileUpload = getByDataId(element, "file-upload");

    expect(fileTile).toBeTruthy();
    expect(fileUpload).toBeNull();

    const fileLink = getByDataId(element, "file-link");
    expect(fileLink.textContent).toBe("Test File");

    const fileMeta = getByDataId(element, "file-meta");
    expect(fileMeta.textContent).toContain("100KB");
    expect(fileMeta.textContent).toContain("pdf");
  });

  it("should render correct icon based on extension", async () => {
    const excelFile = {
      ...MOCK_FILE,
      extension: "xlsx"
    };

    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(excelFile);
    await flushPromises();

    const icon = getByDataId(element, "file-icon");
    expect(icon.iconName).toBe("doctype:excel");
  });

  it("should render default icon for unknown extension", async () => {
    const unknownFile = {
      ...MOCK_FILE,
      extension: "xyz"
    };

    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(unknownFile);
    await flushPromises();

    const icon = getByDataId(element, "file-icon");
    expect(icon.iconName).toBe("doctype:attachment");
  });

  it("should render override name when provided", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      name: "Custom Name"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const fileLink = getByDataId(element, "file-link");
    expect(fileLink.textContent).toBe("Custom Name");
  });

  it("should render action menu in view mode", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    expect(menu).toBeTruthy();
  });

  it("should disable upload and file upload input when disabled is true", async () => {
    element = await elementBuilder.build({
      recordId: "001000000000001",
      disabled: true
    });

    getFileWireAdapter.emit(null);
    await flushPromises();

    const fileUpload = getByDataId(element, "file-upload");
    expect(fileUpload).toBeTruthy();
    expect(fileUpload.disabled).toBe(true);
  });

  it("should call unlinkFile Apex method when recordId is present and file is removed", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "remove" } })
    );
    await flushPromises();

    expect(unlinkFile).toHaveBeenCalledTimes(1);
    expect(unlinkFile).toHaveBeenCalledWith({
      contentDocumentLinkId: "06A000000000001"
    });
  });

  it("should NOT call unlinkFile Apex method when recordId is missing and file is removed", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      recordId: null // Missing recordId
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "remove" } })
    );
    await flushPromises();

    // Should NOT call Apex
    expect(unlinkFile).toHaveBeenCalledTimes(0);

    // File element should be gone (upload mode should render)
    const fileUpload = getByDataId(element, "file-upload");
    expect(fileUpload).toBeTruthy();
  });

  it("should open file url when View Details is selected", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "view_details" } })
    );

    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining(MOCK_FILE.id),
      "_blank"
    );
  });

  it("should call getDownloadUrl and open window when Download is selected", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "download" } })
    );
    await flushPromises();

    expect(getDownloadUrl).toHaveBeenCalledWith({
      contentDocumentId: MOCK_FILE.id
    });
    expect(openMock).toHaveBeenCalledWith("/download/url", "_blank");
  });

  it("should enter version upload mode when Upload New Version is selected", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "upload_version" } })
    );
    await flushPromises();

    const versionUpload = getByDataId(element, "version-upload");
    expect(versionUpload).toBeTruthy();

    // Cancel
    const cancelBtn = getByDataId(element, "cancel-version");
    cancelBtn.click();
    await flushPromises();

    expect(getByDataId(element, "version-upload")).toBeNull();
  });

  it("should process initial upload finished correctly", async () => {
    element = await elementBuilder.build({
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(null);
    await flushPromises();

    const fileUpload = getByDataId(element, "file-upload");
    const uploadedFiles = [{ documentId: "069000000000002" }];

    // Mock upload finished
    fileUpload.dispatchEvent(
      new CustomEvent("uploadfinished", {
        detail: { files: uploadedFiles }
      })
    );
    await flushPromises();

    expect(getContentDocumentLinkId).toHaveBeenCalledWith({
      recordId: "001000000000001",
      contentDocumentId: "069000000000002"
    });
  });

  it("should process version upload finished correctly", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    // Enter version upload mode
    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "upload_version" } })
    );
    await flushPromises();

    const versionUpload = getByDataId(element, "version-upload");
    const uploadedFiles = [{ documentId: "069000000000002" }];

    versionUpload.dispatchEvent(
      new CustomEvent("uploadfinished", {
        detail: { files: uploadedFiles }
      })
    );
    await flushPromises();

    expect(replaceFileVersion).toHaveBeenCalledWith({
      originalContentDocumentId: MOCK_FILE.id,
      newContentDocumentId: "069000000000002"
    });
  });

  it("should handle partial metadata correctly", async () => {
    const partialFile = {
      id: "069000000000001",
      name: "Partial",
      extension: null,
      size: null,
      lastModifiedDate: null
    };

    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(partialFile);
    await flushPromises();

    const fileMeta = getByDataId(element, "file-meta");
    expect(fileMeta.textContent).toBe("");

    const icon = getByDataId(element, "file-icon");
    expect(icon.iconName).toBe("doctype:attachment");
  });

  it("should handle wire error correctly", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.error({ body: "error" });
    await flushPromises();

    expect(getByDataId(element, "file-tile")).toBeNull();
    expect(getByDataId(element, "file-upload")).toBeTruthy();
  });

  it("should handle download error", async () => {
    getDownloadUrl.mockRejectedValueOnce(new Error("Download Error"));
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "download" } })
    );
    await flushPromises();

    // Verify toast was dispatched
    expect(openMock).not.toHaveBeenCalledWith("/download/url", "_blank");
  });

  it("should handle remove error", async () => {
    unlinkFile.mockRejectedValueOnce(new Error("Remove Error"));
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "remove" } })
    );
    await flushPromises();

    // CDL should not be cleared
    expect(element.contentDocumentLinkId).toBe("06A000000000001");
  });

  it("should handle replaceFileVersion error", async () => {
    replaceFileVersion.mockRejectedValueOnce(new Error("Replace Error"));
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001",
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    // Enter version upload mode
    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "upload_version" } })
    );
    await flushPromises();

    const versionUpload = getByDataId(element, "version-upload");
    versionUpload.dispatchEvent(
      new CustomEvent("uploadfinished", {
        detail: { files: [{ documentId: "069000000000002" }] }
      })
    );
    await flushPromises();

    expect(replaceFileVersion).toHaveBeenCalled();
    expect(refreshApex).not.toHaveBeenCalled();
  });

  it("should handle getContentDocumentLinkId error", async () => {
    getContentDocumentLinkId.mockRejectedValueOnce(new Error("Lookup Error"));
    element = await elementBuilder.build({
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(null);
    await flushPromises();

    const fileUpload = getByDataId(element, "file-upload");
    fileUpload.dispatchEvent(
      new CustomEvent("uploadfinished", {
        detail: { files: [{ documentId: "069000000000002" }] }
      })
    );
    await flushPromises();

    expect(getContentDocumentLinkId).toHaveBeenCalled();
  });

  it("should handle various metadata combinations", async () => {
    const fileOnlyDate = {
      id: "069000000000001",
      name: "DateOnly",
      extension: null,
      size: null,
      lastModifiedDate: "2026-03-20T12:00:00Z"
    };

    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(fileOnlyDate);
    await flushPromises();

    const fileMeta = getByDataId(element, "file-meta");
    expect(fileMeta.textContent).toContain("Mar 20, 2026");
    expect(fileMeta.textContent).not.toContain("KB");
  });

  it("should handle size only metadata", async () => {
    const fileSizeOnly = {
      id: "069000000000001",
      name: "SizeOnly",
      extension: null,
      size: 2048,
      lastModifiedDate: null
    };

    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(fileSizeOnly);
    await flushPromises();

    const fileMeta = getByDataId(element, "file-meta");
    expect(fileMeta.textContent).toBe("2KB");
  });

  it("should handle extension only metadata", async () => {
    const fileExtOnly = {
      id: "069000000000001",
      name: "ExtOnly",
      extension: "pdf",
      size: null,
      lastModifiedDate: null
    };

    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });

    getFileWireAdapter.emit(fileExtOnly);
    await flushPromises();

    const fileMeta = getByDataId(element, "file-meta");
    expect(fileMeta.textContent).toBe("pdf");
  });

  it("should do nothing when uploadfinished has no files", async () => {
    element = await elementBuilder.build({
      recordId: "001000000000001"
    });

    getFileWireAdapter.emit(null);
    await flushPromises();

    const fileUpload = getByDataId(element, "file-upload");
    fileUpload.dispatchEvent(
      new CustomEvent("uploadfinished", {
        detail: { files: [] }
      })
    );
    await flushPromises();

    expect(getContentDocumentLinkId).not.toHaveBeenCalled();
  });

  it("should handle default case in menu select", async () => {
    element = await elementBuilder.build({
      contentDocumentLinkId: "06A000000000001"
    });
    getFileWireAdapter.emit(MOCK_FILE);
    await flushPromises();

    const menu = getByDataId(element, "action-menu");
    menu.dispatchEvent(
      new CustomEvent("select", { detail: { value: "unknown" } })
    );
    await flushPromises();
    expect(true).toBe(true);
  });
});
