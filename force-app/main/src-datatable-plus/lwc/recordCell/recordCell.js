import { LightningElement, api, wire, track } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

export default class RecordCell extends LightningElement {
  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  @track state = {};

  _value = "";

  @api props = {};

  get fields() {
    const field = this.props?.displayField;
    return [field];
  }

  @wire(getRecord, { recordId: "$value", fields: "$fields" })
  wiredRecord({ data, error }) {
    if (data) {
      this._value = getFieldValue(data, this.props?.displayField);
    } else if (error) {
      this._value = "";
    }
  }
}
