import { LightningElement, api } from "lwc";

export default class DatatablePicklistCell extends LightningElement {
  @api value = "";
  @api options = "[]";

  get formattedValue() {
    const options = JSON.parse(this.options);
    return !this.value || !options?.length
      ? ""
      : options.find(({ value }) => value === this.value).label;
  }
}
