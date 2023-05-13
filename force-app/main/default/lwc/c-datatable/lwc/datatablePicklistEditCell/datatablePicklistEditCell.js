import { LightningElement, api, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { publish, subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext, } from 'lightning/messageService'
import dataTableMessageChannel from '@salesforce/messageChannel/DataTable__c';

export default class DatatablePicklistEditCell extends LightningElement {

  @api rowId;

  @api placeholder = 'Select an option';

  @api options = [];

  @api recordTypeId;

  @api controllerFieldApiName;

  _objectApiName = null;

  _value = null;

  _fieldApiName = null;

  _wireFieldApiNameObject = {};

  @api
  get fieldApiName() {
    return this._fieldApiName;
  }

  set fieldApiName(value) {
    this._fieldApiName = value;
    this._wireFieldApiNameObject.fieldApiName = value;
  }

  @api
  get objectApiName() {
    return this._objectApiName;
  }

  set objectApiName(value) {
    this._objectApiName = value;
    this._wireFieldApiNameObject.objectApiName = value;
  }

  @api
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  disabled = true;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: '$_wireFieldApiNameObject' })
  picklistInfo;

  

  get actualOptions() {
    const values = this.picklistInfo?.data?.values;
    this.disabled = false;
    if (!this.recordTypeId) {
      return JSON.parse(this.options);
    } else if (this.controllerFieldApiName && values) {
      const controllerValues = this.picklistInfo?.data?.controllerValues;
      const key = controllerValues[this.controllingFieldValue];
      const result = values.filter(opt => opt.validFor.includes(key));
      return result;
    } else if (values) {
      return values;
    }

    this.disabled = true;
    return [];
  }

  handleChange(e) {
    e.stopPropagation();

    this._value = e.detail.value;

    this.dispatchEvent(new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {
            value: this._value,
        },
    }));
  }

  handleFocus(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('focus', {
        bubbles: true,
        composed: true
    }));
  }

  handleBlur(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('blur', {
        bubbles: true,
        composed: true
    }));
  }

  @api
  get validity() {
    return this.template.querySelector('lightning-combobox').validity;
  }

  @api
  showHelpMessageIfInvalid() {
    this.template.querySelector('lightning-combobox').showHelpMessageIfInvalid();
  }

  @api
  focus() {
    this.template.querySelector('lightning-combobox').focus();
  }

  subscription = null;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.subscribeToMessageChannel();
    publish(
      this.messageContext,
      dataTableMessageChannel,
      {
        action: 'picklistValueRequest' ,
        detail: {
          rowId: this.rowId,
          fieldApiName: this.controllerFieldApiName
        }
      }
    );
  }

  @wire(MessageContext)
  messageContext;

  // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
  subscribeToMessageChannel() {
      if (!this.subscription) {
          this.subscription = subscribe(
              this.messageContext,
              dataTableMessageChannel,
              (message) => this.handleMessage(message),
              { scope: APPLICATION_SCOPE }
          );
      }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  controllingFieldValue;
  handleMessage({ action, detail }) {
    if (action === 'picklistValueResponse') {
      if (this.rowId === detail.rowId) {
        this.controllingFieldValue = detail.value;
      }
    }
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }
}