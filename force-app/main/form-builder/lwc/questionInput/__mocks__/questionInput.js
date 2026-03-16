import { LightningElement, api } from "lwc";
export default class QuestionInput extends LightningElement {
  @api label;
  @api props = {};
  @api type;
  @api validity = { valid: true };
  @api value;

  @api focus = jest.fn();
  @api showHelpMessageIfInvalid = jest.fn();
}
