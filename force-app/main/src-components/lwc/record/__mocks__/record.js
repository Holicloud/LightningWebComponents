import { LightningElement, api } from "lwc";

export default class Records extends LightningElement {
  @api separator;
  @api displayField;
  @api value;
}
