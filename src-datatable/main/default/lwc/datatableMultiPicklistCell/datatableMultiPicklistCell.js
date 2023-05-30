import { LightningElement, api } from "lwc";

export default class DatatableMultiPicklistCell extends LightningElement {
  @api value = "";
  @api options = "[]";

  get formattedValue() {
    const options = JSON.parse(this.options);
    return !this.value || !options?.length
      ? ""
      : this.value
          .split(";")
          .map(
            (singleValue) =>
              options.find(({ value }) => value === singleValue).label
          )
          .join(";");
  }
}
