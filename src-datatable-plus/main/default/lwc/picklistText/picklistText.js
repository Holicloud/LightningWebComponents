import { LightningElement, api } from "lwc";

export default class PicklistText extends LightningElement {
  @api value;
  @api props = {};

  get label() {
    const options = this.props.options;
    return options.find(({ value }) => value === this.value)?.label;
  }
}
