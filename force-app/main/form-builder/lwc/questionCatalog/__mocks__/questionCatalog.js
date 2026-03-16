import { LightningElement, api } from "lwc";
export default class QuestionCatalog extends LightningElement {
  @api editable = false;
  @api formDefinitionId;
  @api formResponseId;
  @api isSubmittable = false;
  @api sections;
}
