import { LightningElement, api, wire } from "lwc";
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import dataTableMessageChannel from "@salesforce/messageChannel/DataTable__c";

export default class DatatablePicklistEditCell extends LightningElement {
  // public properties

  @api parentName;
  @api placeholder = "Select an option";
  @api rowId;
  @api fieldName;
  // private properties

  _disabled = true;
  _subscription = null;
  _value = "";
  _options = [];

  // public getters-setters

  @api
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  // public methods

  @api
  get validity() {
    return this.inputElement.validity;
  }

  @api
  showHelpMessageIfInvalid() {
    this.inputElement.showHelpMessageIfInvalid();
  }

  @api
  focus() {
    this.inputElement.focus();
  }

  // wire methods

  @wire(MessageContext)
  messageContext;

  // private methods

  _handleChange(e) {
    e.stopPropagation();

    this._value = e.detail.value;

    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: {
          value: this._value
        }
      })
    );
  }

  _handleFocus(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("focus", {
        bubbles: true,
        composed: true
      })
    );
  }

  _handleBlur(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("blur", {
        bubbles: true,
        composed: true
      })
    );
  }

  _subscribeToMessageChannel() {
    if (!this._subscription) {
      this._subscription = subscribe(
        this.messageContext,
        dataTableMessageChannel,
        (message) => this._handleMessage(message),
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  _unsubscribeToMessageChannel() {
    unsubscribe(this._subscription);
    this._subscription = null;
  }

  _handleMessage({ action, detail }) {
    const { rowId, values } = detail;
    if (action === "rowinforesponse" && this.rowId === rowId) {
      this._options = values;
      this._disabled = false;
    }
  }

  // hooks

  connectedCallback() {
    this._subscribeToMessageChannel();
    this.dispatchEvent(
      new CustomEvent("rowinforequest", {
        detail: {
          rowId: this.rowId,
          fieldName: this.fieldName,
          parentName: this.parentName
        },
        bubbles: true,
        composed: true
      })
    );
  }

  disconnectedCallback() {
    this._unsubscribeToMessageChannel();
  }

  get inputElement() {
    return this.template.querySelector("lightning-combobox");
  }
}
