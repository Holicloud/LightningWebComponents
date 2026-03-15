import { getRecords, getFieldValue } from "lightning/uiRecordApi";
import { LightningElement, api, wire, track } from "lwc";

export default class Records extends LightningElement {
  @api displayField;
  @api separator = ",";

  @track fetchedLabels = {};
  _value = [];

  fetched = false;

  @api
  get value() {
    return this._value;
  }

  set value(val) {
    if (Array.isArray(val)) {
      this._value = val;
    } else if (val) {
      this._value = [val];
    } else {
      this._value = [];
    }
  }

  @wire(getRecords, { records: "$payload" })
  wiredRecord({ data }) {
    if (data?.results?.length) {
      for (const { statusCode, result } of data.results) {
        if (statusCode === 200) {
          this.fetchedLabels[result.id] = getFieldValue(
            result,
            this.displayField
          );
        }
      }
      this.fetched = true;
    }
  }

  get payload() {
    return [
      {
        recordIds: Array.isArray(this._value) ? this._value : [],
        fields: this.displayField ? [this.displayField] : []
      }
    ];
  }

  get valueToDisplay() {
    if (!this._value.length) {
      return "";
    }

    if (this.fetched) {
      return this._value
        .map((value) => this.fetchedLabels[value])
        .join(this.separator);
    }

    return this._value.join(this.separator);
  }
}
