import { refreshApex } from "@salesforce/apex";
import getFile from "@salesforce/apex/FormattedFileController.getFile";
import { LightningElement, api, wire } from "lwc";

const ICON_MAP = Object.freeze({
  pdf: "doctype:pdf",
  doc: "doctype:word",
  docx: "doctype:word",
  xls: "doctype:excel",
  xlsx: "doctype:excel",
  ppt: "doctype:ppt",
  pptx: "doctype:ppt",
  png: "doctype:image",
  jpg: "doctype:image",
  jpeg: "doctype:image",
  gif: "doctype:image",
  zip: "doctype:zip",
  txt: "doctype:txt",
  csv: "doctype:csv",
  xml: "doctype:xml",
  html: "doctype:html"
});

export default class FormattedFile extends LightningElement {
  @api contentDocumentId;
  @api hidePreview = false;
  @api name;

  @api
  async refresh() {
    this._showIcon = false;
    this._timestamp = `&t=${new Date().getTime()}`;
    await refreshApex(this._wiredFileResult);
    // Force re-processing of the data in case the wire didn't refire
    if (this._wiredFileResult && this._wiredFileResult.data) {
      this._processFileData(this._wiredFileResult.data);
    }
  }

  _file;
  _timestamp = "";
  _wiredFileResult;

  @wire(getFile, { contentDocumentId: "$contentDocumentId" })
  wiredFile(result) {
    this._wiredFileResult = result;
    const { error, data } = result;
    if (data) {
      this._showIcon = false;
      this._processFileData(data);
    } else if (error) {
      this._file = null;
    }
  }

  get file() {
    return this._file;
  }

  _formatMetadata(file) {
    const parts = [];
    if (file.lastModifiedDate) {
      const date = new Date(file.lastModifiedDate);
      parts.push(
        new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }).format(date)
      );
    }
    if (file.size) {
      parts.push(`${Math.round(file.size / 1024)}KB`);
    }
    if (file.extension) {
      parts.push(file.extension);
    }
    return parts.join(" • ");
  }

  _getIconName(extension) {
    if (!extension) {
      return "doctype:attachment";
    }
    const ext = extension.toLowerCase();
    return ICON_MAP[ext] || "doctype:attachment";
  }

  _processFileData(data) {
    this._file = {
      ...data,
      displayName: this.name || data.name,
      fileUrl: `/lightning/r/ContentDocument/${data.id}/view`,
      formattedMetadata: this._formatMetadata(data),
      iconName: this._getIconName(data.extension),
      thumbnailUrl: data.latestVersionId
        ? `/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${data.latestVersionId}${this._timestamp}`
        : null
    };
  }

  handleImageError() {
    this._showIcon = true;
  }
}
