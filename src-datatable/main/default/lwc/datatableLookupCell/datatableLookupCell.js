import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

export default class DatatableLookupCell extends LightningElement {

  // @api title;
  
  @api target;
  @api tooltip;
  @api recordId;
  _sets = [];

  @api sets;
  // get sets() {
  //   return this._sets;
  // }

  // set sets(value) {
  //   this._sets = JSON.parse(value);
  // }

  record;
  
  @wire(getRecord, { recordId: '$recordId', fields: '$fields' } )
  wiredRecord({ data, error }) {
    if (data) {
      this.record = data;
    } else if (error) {
      this.record = undefined;       
    }
  }

  get label() {
    return this.recordId ? getFieldValue(this.record, this.title) : "";
  }

  get value() {
    return this.recordId ? ('/' + this.recordId) : "";
  }

  get fields() {
    return [ 'Account.Name', 'Opportunity.Name' ];
  }

  // get fields() {
  //   return this._sets.map(({ sobjectApiName, fields }) => {
  //     return sobjectApiName + '.' + fields.find(({ primary }) => primary).name
  //   });
  // }
}