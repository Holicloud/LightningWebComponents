import { LightningElement, api } from "lwc";

export default class WizardStep extends LightningElement {
  @api hideNextButton;
  @api hidePreviousButton;
  @api isActive;
  @api label;
  @api name;
  @api validate;
}
