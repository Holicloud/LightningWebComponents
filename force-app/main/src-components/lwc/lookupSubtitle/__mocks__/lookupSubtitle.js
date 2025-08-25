import { LightningElement, api } from "lwc";

export default class lookupSubtitle extends LightningElement {
  @api subtitle;
  @api props;
}
