import { refreshApex } from "@salesforce/apex";
import getContentDocumentLinkId from "@salesforce/apex/FileUploadController.getContentDocumentLinkId";
import getDownloadUrl from "@salesforce/apex/FileUploadController.getDownloadUrl";
import getFile from "@salesforce/apex/FileUploadController.getFile";
import replaceFileVersion from "@salesforce/apex/FileUploadController.replaceFileVersion";
import unlinkFile from "@salesforce/apex/FileUploadController.unlinkFile";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
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

export default class FileUpload extends LightningElement {
  @api accept;
  @api disabled = false;
  @api label = "Upload Files";
  @api name;
  @api recordId;

  @api
  get contentDocumentLinkId() {
    return this._contentDocumentLinkId;
  }
  set contentDocumentLinkId(value) {
    this._contentDocumentLinkId = value;
  }

  _contentDocumentLinkId;
  _file;
  _isUploadingNewVersion = false;
  _wiredFileResult;

  @wire(getFile, { recordId: "$_contentDocumentLinkId" })
  wiredFile(result) {
    this._wiredFileResult = result;
    const { error, data } = result;
    if (data) {
      this._processFileData(data);
    } else if (error) {
      this._file = null;
    }
  }

  get containerClass() {
    return this.disabled ? "container disabled-state" : "container";
  }

  get file() {
    return this._file;
  }

  get menuItems() {
    return [
      {
        label: "View Details",
        value: "view_details",
        iconName: "utility:preview"
      },
      {
        label: "Download",
        value: "download",
        iconName: "utility:download"
      },
      {
        label: "Upload New Version",
        value: "upload_version",
        iconName: "utility:upload",
        disabled: this.disabled
      },
      {
        label: "Remove File",
        value: "remove",
        iconName: "utility:delete",
        disabled: this.disabled
      }
    ];
  }

  get showNewVersionUpload() {
    return this._isUploadingNewVersion;
  }

  get showUploadMode() {
    return !this._file && !this._isUploadingNewVersion;
  }

  get showViewMode() {
    return !!this._file && !this._isUploadingNewVersion;
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

  async _handleDownload() {
    if (!this._file) {
      return;
    }
    try {
      const url = await getDownloadUrl({
        contentDocumentId: this._file.id
      });
      if (url) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error getting download URL", error);
      this._showToast("Error", "Could not get download URL", "error");
    }
  }

  async _handleRemove() {
    if (!this._contentDocumentLinkId) {
      return;
    }
    try {
      // Only call unlinkFile if recordId is present (actual record link)
      if (this.recordId) {
        await unlinkFile({
          contentDocumentLinkId: this._contentDocumentLinkId
        });
      }

      this._contentDocumentLinkId = null;
      this._file = null;
      this.dispatchEvent(new CustomEvent("remove"));
    } catch (error) {
      console.error("Error unlinking file", error);
      this._showToast("Error", "Could not remove file", "error");
    }
  }

  _handleUploadVersion() {
    this._isUploadingNewVersion = true;
  }

  _handleViewDetails() {
    if (this._file) {
      window.open(this._file.fileUrl, "_blank");
    }
  }

  _processFileData(data) {
    this._file = {
      ...data,
      displayName: this.name || data.name,
      fileUrl: `/lightning/r/ContentDocument/${data.id}/view`,
      formattedMetadata: this._formatMetadata(data),
      iconName: this._getIconName(data.extension)
    };
  }

  _showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(event);
  }

  handleCancelUploadVersion() {
    this._isUploadingNewVersion = false;
  }

  async handleMenuSelect(event) {
    const action = event.detail.value;
    switch (action) {
      case "view_details":
        this._handleViewDetails();
        break;
      case "download":
        await this._handleDownload();
        break;
      case "upload_version":
        this._handleUploadVersion();
        break;
      case "remove":
        await this._handleRemove();
        break;
      default:
        break;
    }
  }

  async handleUploadFinished(event) {
    const uploadedFiles = event.detail.files;
    if (uploadedFiles.length > 0) {
      this._isUploadingNewVersion = false;

      // Uploading a new version: move the file data into the original document
      if (this._file && this._contentDocumentLinkId) {
        try {
          await replaceFileVersion({
            originalContentDocumentId: this._file.id,
            newContentDocumentId: uploadedFiles[0].documentId
          });
          await refreshApex(this._wiredFileResult);
        } catch (error) {
          console.error("Error replacing file version", error);
          this._showToast("Error", "Could not replace file version", "error");
        }
      } else {
        // Initial upload: look up the newly created CDL
        try {
          const cdlId = await getContentDocumentLinkId({
            recordId: this.recordId,
            contentDocumentId: uploadedFiles[0].documentId
          });
          if (cdlId) {
            this._contentDocumentLinkId = cdlId;
          }
        } catch (error) {
          console.error("Error retrieving ContentDocumentLink", error);
          this._showToast("Error", "Could not link file to record", "error");
        }
      }

      this.dispatchEvent(
        new CustomEvent("uploadfinished", {
          detail: { files: uploadedFiles }
        })
      );
    }
  }
}
