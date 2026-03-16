import { LightningElement, api } from "lwc";
export default class QuestionRuleCondition extends LightningElement {
  @api condition = {};
  @api formDefinitionId;
  @api index;
  @api questionCatalogId;

  @api validate = jest.fn().mockReturnValue(true);
}
