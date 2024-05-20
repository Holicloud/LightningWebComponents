import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

export default class RecordCell extends LightningElement {
  @api
  get value() {
    return this._value;
  }
  set value(value) {
    if (!value) {
      this.formattedValue = "";
    }

    this._value = value;
  }

  _value;
  _typeAttributes = {};
  formattedValue = "";

  @api
  get typeAttributes() {
    return this._typeAttributes;
  }
  set typeAttributes(value) {
    if (value) {
      this._typeAttributes = value;
    }
  }

  get fields() {
    const field = this._typeAttributes.displayField;
    return [field];
  }

  @wire(getRecord, { recordId: "$_value", fields: "$fields" })
  wiredRecord({ data, error }) {
    if (data) {
      this.formattedValue = getFieldValue(data, this._typeAttributes.displayField);
    } else if (error) {
      this.formattedValue = "";
    }
  }
}
