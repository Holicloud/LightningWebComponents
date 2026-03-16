import { LightningElement, api } from "lwc";
export default class NewQuestionRuleModal extends LightningElement {
  @api formDefinitionId;
  @api questionCatalogId;
  @api questionCatalogName;
  @api questionRuleId;

  static open = jest.fn();
}
