import { LightningElement, api, wire } from 'lwc';
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext, } from 'lightning/messageService'
import dataTableMessageChannel from '@salesforce/messageChannel/DataTable__c';

export default class DatatablePicklistEditCell extends LightningElement {

  // public properties

  @api rowId;

  @api placeholder = 'Select an option';

  @api options = [];

  @api recordTypeId;

  @api controllerFieldApiName;

  // private properties

  _objectApiName = null;

  _value = null;

  _fieldApiName = null;

  _wireFieldApiNameObject = {};

  _subscription = null;

  _disabled = true;

  _controllingFieldValue;

  _fieldDependency = null;

  // public getters-setters

  @api
  get fieldApiName() {
    return this._fieldApiName;
  }

  set fieldApiName(value) {
    this._fieldApiName = value;
  }

  @api
  get objectApiName() {
    return this._objectApiName;
  }

  set objectApiName(value) {
    this._objectApiName = value;
  }

  @api
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  // private getters-setters

  get actualOptions() {
    const {values, controllerValues} = this._fieldDependency;
    this._disabled = false;
    if (!this.recordTypeId) {
      return JSON.parse(this.options);
    } else if (this.controllerFieldApiName && values) {
      const key = controllerValues[this._controllingFieldValue];
      const result = values.filter(opt => opt.validFor.includes(key));
      return result;
    } else if (values) {
      return values;
    }

    this._disabled = true;
    return [];
  }

  // public methods

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

  // wire methods

  @wire(MessageContext)
  messageContext;

  // private methods

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

  subscribeToMessageChannel() {
    if (!this._subscription) {
        this._subscription = subscribe(
            this.messageContext,
            dataTableMessageChannel,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this._subscription);
    this._subscription = null;
  }


  handleMessage({ action, detail }) {
    if (action === 'valueResponse') {
      if (this.rowId === detail.rowId) {
        this._fieldDependency = detail.fieldDependency;
        this._controllingFieldValue = detail.value;
      }
    }
  }

  // hooks

  connectedCallback() {
    this.subscribeToMessageChannel();
    const detail = {
      rowId: this.rowId,
      controllerFieldApiName: this._fieldApiName,
      fieldApiName: this.controllerFieldApiName,
      recordTypeId : this.recordTypeId
    };
    this.dispatchEvent(new CustomEvent('valuerequest', {
        detail,
        bubbles: true,
        composed: true
    }));
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }
}