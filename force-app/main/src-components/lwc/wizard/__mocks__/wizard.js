import { LightningElement, api } from "lwc";

export default class Wizard extends LightningElement {
  @api currentStep;
  @api finishLabel;
  @api header;
  @api nextLabel;
  @api previousLabel;
  @api variant;
}
