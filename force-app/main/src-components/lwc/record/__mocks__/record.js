import { LightningElement, api } from "lwc";

export default class Records extends LightningElement {
  @api displayField;
  @api separator;
  @api value;
}
