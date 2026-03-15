import { LightningElement, api } from "lwc";

export default class ErrorsAccordion extends LightningElement {
  @api errors;
  @api isHidden;
  @api isNonDismissable;
  @api title;
}
