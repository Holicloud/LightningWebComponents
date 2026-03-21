import { LightningElement, api } from "lwc";

export default class FormattedFileBasic extends LightningElement {
  @api recordId;
  contentDocumentId;
  hidePreview = false;

  get acceptedFormats() {
    return [".pdf", ".png", ".jpg", ".jpeg", ".txt"];
  }

  handleHidePreviewChange(event) {
    this.hidePreview = event.target.checked;
  }

  handleRefresh() {
    const component = this.template.querySelector('[data-id="formatted-file"]');
    if (component) {
      component.refresh();
    }
  }

  handleUploadFinished(event) {
    // Get the list of uploaded files
    const uploadedFiles = event.detail.files;
    if (uploadedFiles.length > 0) {
      this.contentDocumentId = uploadedFiles[0].documentId;

      // Automatically try to refresh once after 30 seconds to fetch the generated rendition
      // and this is an example component where async refresh is needed for UX.
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        this.handleRefresh();
      }, 30000);
    }
  }
}
