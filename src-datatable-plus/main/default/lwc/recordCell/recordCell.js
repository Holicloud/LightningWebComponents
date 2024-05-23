import { LightningElement, api, wire, track } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

export default class RecordCell extends LightningElement {
  @api value;

  @track state = {};

  _value = "";
  _typeAttributes = {};

  @api typeAttributes = {};

  get fields() {
    const field = this.typeAttributes?.displayField;
    return [field];
  }

  @wire(getRecord, { recordId: "$value", fields: "$fields" })
  wiredRecord({ data, error }) {
    if (data) {
      this._value = getFieldValue(data, this.typeAttributes?.displayField);
    } else if (error) {
      this._value = "";
    }
  }
}
