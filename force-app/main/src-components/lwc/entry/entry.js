import { LightningElement, api } from "lwc";

export default class Entry extends LightningElement {
  @api value;
  @api separator = ",";
  @api options = {};

  get formattedValue() {
    if (!Array.isArray(this.value)) {
      if (Object.keys(this.options)?.length) {
        const label = this.options[this.value];

        if (label) {
          return label;
        }
      }

      return this.value ? `[${this.value}]` : "";
    }

    if (!this.value?.length) {
      return "";
    }

    const separator = this.separator || ",";

    const result = [];

    for (const selected of this.value) {
      if (Object.keys(this.options)?.length) {
        const label = this.options[selected];
        result.push(label || `[${selected}]`);
      } else {
        result.push(`[${selected}]`);
      }
    }

    if (result.length) {
      return result.join(separator);
    }

    return "";
  }
}
