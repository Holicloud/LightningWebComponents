import { LightningElement, api } from "lwc";

export default class ErrorsAccordion extends LightningElement {
  @api title;
  @api isNonDismissable;
  @api errors;
  @api isHidden;
}
