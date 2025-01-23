import { LightningElement, api } from "lwc";

export default class LightningFormattedDynamicOutput extends LightningElement {
  @api type;
  @api value;
  @api props;
}
