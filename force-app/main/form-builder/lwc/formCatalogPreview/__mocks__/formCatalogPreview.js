import { LightningElement, api } from "lwc";
export default class FormCatalogPreview extends LightningElement {
  @api editable;
  @api recordId;
  @api section;
}
