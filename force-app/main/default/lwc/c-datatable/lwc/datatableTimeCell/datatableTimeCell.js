import { LightningElement, api } from 'lwc';

export default class DatatableTimeCell extends LightningElement {
  @api value = '';

  get formattedTimeValue() {
    const date = new Date(this.value);
    const validDate = date instanceof Date && !isNaN(date.getTime());

    return validDate ? date.toISOString()?.split('T')[1] : '';
  }
}