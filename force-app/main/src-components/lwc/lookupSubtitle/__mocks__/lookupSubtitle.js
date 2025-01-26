import { LightningElement, api } from "lwc";

export default class lookupSubtitle extends LightningElement {
  @api type;
  @api value;
  @api props;
}
