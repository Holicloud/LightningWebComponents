import { LightningElement, api } from "lwc";

export default class MultipicklistText extends LightningElement {
  @api value = [];
  @api props = {};

  get formattedValue() {
    const { options, separator = ";" } = this.props;

    if (this.value?.length && options?.length) {
      return options
        .filter(({ value }) => this.value.includes(value))
        .map(({ label }) => label)
        .join(separator);
    }

    return "";
  }
}
