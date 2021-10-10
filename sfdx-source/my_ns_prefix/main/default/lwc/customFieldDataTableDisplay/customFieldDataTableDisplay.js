
import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CustomFieldDataTableDisplay extends NavigationMixin(LightningElement) {
    @api recordId;
    @api editable;
    @api fieldName;
    @api lookupRecordId;
    _value;
    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this.setAttribute('value', value);
        this._value = value;
    }
    @api maxLength;
    // for picklists
    _numberOfDecimals;
    @api
    get numberOfDecimals() {
        return this._numberOfDecimals;
    }
    set numberOfDecimals(numberOfDecimals) {
        this.setAttribute('numberOfDecimals', numberOfDecimals);
        this._numberOfDecimals = numberOfDecimals;
    }
    significantDigits;
    @track _type;
    @api
    get type() {
        return this._type;
    }
    set type(type) {
        this.setAttribute('type', type);
        this._type = type;
    }
    get formattedValue() {
        let value = this._value;
        let valueInt = parseFloat(value);
        let stringValue = valueInt.toString();
        let numberOfIntegers = stringValue.length;
        if (stringValue.indexOf('.') !== -1) {//has decimals
            const numberOfDecimals = stringValue.split('.')[1].length;
            numberOfIntegers = stringValue.split('.')[0].length;
            if (numberOfIntegers + numberOfDecimals > this.maxLength) {
                stringValue = valueInt.toFixed(numberOfDecimals).substring(0, this.maxLength);
            }
        } else {
            if (numberOfIntegers > 15) {
                stringValue = Math.round(valueInt).toString().substring(0, 15);
                numberOfIntegers = stringValue.length;
            }
        }
        this.significantDigits = this.numberOfDecimals + numberOfIntegers;
        this._value = stringValue;
        return stringValue;
    }


    get isPercentFixed() {
        return this.type && this.value && this.type === 'percent-fixed' && this.maxLength && this._numberOfDecimals;
    }

    get isLookup() {
        return this.type && this.value && this.lookupRecordId && this.type === 'lookup';
    }

    get standard() {
        return !this.isPercentFixed && !this.isLookup;
    }

    appearIcon() {
        if (this.editable) {
            this.template.querySelector('.edit_icon').classList.remove('hideButton');
        }
    }
    dissapearIcon() {
        this.template.querySelector('.edit_icon').classList.add('hideButton');
    }
    handleClickEdit() {
        let directions = this.template.querySelector('div').getBoundingClientRect();
        this.dispatchEvent(new CustomEvent('customfieldedit', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                recordId: this.recordId,
                value: this.value,
                fieldName: this.fieldName,
                fieldPosition: directions,
                lookupRecordId: this.lookupRecordId
            }
        }));
    }
    navigateToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.lookupRecordId,
                actionName: 'view'
            }
        });
    }
}