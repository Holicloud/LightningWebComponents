import { LightningElement, api } from "lwc";

export default class FileUploadBasic extends LightningElement {
  @api recordId;
  contentDocumentLinkId;
  isDisabled = false;
  statusMessage;

  get acceptedFormats() {
    return [".pdf", ".png", ".jpg", ".jpeg", ".txt", ".docx", ".xlsx"];
  }

  handleDisabledChange(event) {
    this.isDisabled = event.target.checked;
  }

  handleRemove() {
    this.contentDocumentLinkId = undefined;
    this.statusMessage = "File removed successfully.";
  }

  handleUploadFinished() {
    this.statusMessage = "File uploaded successfully.";
  }
}
