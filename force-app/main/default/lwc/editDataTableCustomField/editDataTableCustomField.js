import { api, LightningElement, track } from 'lwc';
export default class EditDataTableCustomField extends LightningElement {
    @api recordId;
    @api fieldName;
    @api popUpDirections;
    @api value;
    @track _options;
    @api
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = value;
    }
    @api numberOfRecordsSelected;
    @track _placeholder;
    @api
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(value) {
        this._placeholder = value;
    }
    _fieldType;
    @api
    get fieldType() {
        return this._fieldType;
    }
    set fieldType(fieldType) {
        this.setAttribute('fieldType', fieldType);
        this._fieldType = fieldType;
    }
    hasRender;
    renderedCallback() {
        if (!this.hasRender) {
            this.hasRender = true;
        }
    }
    containers = ['picklistContainer', 'inputPercentageContainer','lookupContainer'];
    handleFocusOut() {
        if (!this.multipleSelected) {
            this.handleChange();
        }
    }
    removeElements() {
        if (this.containers) {
            for (const container of this.containers){
                const containerElement = this.template.querySelector(`.${container}`);
                // const inputElement = this.template.querySelector(`[data-id="inputLookup"]`);
                containerElement.classList.add('slds-hide');
                // if (inputElement) {
                //     this.template.remove
                // }
            }
        }
    }
    get multipleSelected() {
        return this.numberOfRecordsSelected > 0;
    }
    get updateSelectedLabel() {
        return `Update (${this.numberOfRecordsSelected}) selected items`;
    }
    get styleGiven() {
        if (this.popUpDirections!==undefined) {
            return `z-index: 9006; background-color: white; margin-top: 1px; display: block; position: fixed; left: ${this.popUpDirections.left}px; right: ${this.popUpDirections.right}px; top: ${this.popUpDirections.top}px`;
        }
    }
    handleKeyPress({ code }) {
        if ('Escape' === code) {
            this.displayPopUp(false);
        }
    }
    @api displayPopUp(on) {
        if (on) {
            this.removeElements();
            this.template.querySelector('section').classList.remove('slds-hide');
            if (this.hasRender) {
                let container;
                let input;
                switch (this._fieldType) {
                    case 'picklist':
                        container = 'picklistContainer';
                        input = 'picklistInput';
                        break;
                    case 'percent-fixed':
                        container = 'inputPercentageContainer';
                        input = 'inputPercentage';
                        break;
                    case 'lookup':
                        container = 'lookupContainer';
                        input = 'inputLookup';
                        break;
                    default:
                        break;
                }
                if (input && container) {
                    const containerElement = this.template.querySelector(`.${container}`);
                    const inputElement = this.template.querySelector(`[data-id="${input}"]`);
                    if (input==='inputPercentage') {
                        inputElement.setCustomValidity(``);
                        inputElement.reportValidity();
                    }
                    if (!this._fieldType === 'lookup') {
                        inputElement.focus();
                    }
                    containerElement.classList.remove('slds-hide');
                }
            }
        } else {
            if (this._fieldType === 'lookup') {
                const inputElement = this.template.querySelector(`[data-id="inputLookup"]`);
                if (Boolean(this.validLookup && inputElement)) {
                    inputElement.handleRemove();
                }
            }
            this.template.querySelector('section').classList.add('slds-hide');
            this.removeElements();
        }
    }
    @api objectApiName;
    @api searchByApiName;
    get validLookup() {
        return Boolean(this._fieldType === 'lookup' && this.objectApiName && this.searchByApiName && this.additionalFields);
    }
    handleChange() {
        if (!this.multipleSelected) {
            this.throwEvent(false);
        }
    }
    handleApply() {
        const updateSelected = this.template.querySelector('[data-id="updateAll"]').checked;
        this.throwEvent(updateSelected);
        this.displayPopUp(false);
    }
    handleCancel() {
        this.displayPopUp(false);
    }
    throwEvent(updateSelected) {
        let newValue;
        let selectedRecord;
        switch (this._fieldType) {
            case 'picklist':
                newValue = this.template.querySelector('[data-id="picklistInput"]').value;
                break;
            case 'percent-fixed':
                newValue = this.template.querySelector('[data-id="inputPercentage"]').value;
                if (!this.validateInputPercentage(newValue)) return;
                break;
            case 'lookup':
                selectedRecord = this.template.querySelector('[data-id="inputLookup"]').selectedRecord;
                newValue = selectedRecord.Id;
                break;
            default:
                break;
        }
        let send = {
            detail: {
                data: {
                    recordId: this.recordId,
                    value: newValue
                },
                fieldName: this.fieldName,
                updateAlsoSelected: updateSelected,
            }
        };
        if (this._fieldType === 'lookup') {
            send.detail.data.displayValue = selectedRecord[this.searchByApiName];
        }
        this.dispatchEvent(new CustomEvent('fieldchanged',send ));
        this.displayPopUp(false);
    }
    handlePercentageChanged(event) {
        event.preventDefault();
        this.validateInputPercentage(event.detail.value);
    }
    validateInputPercentage(value) {
        var inputCmp = this.template.querySelector("[data-id='inputPercentage']");
        let okiDoki = true;
        const currentValueLength = value.length;
        let numberOfIntegers = value.length;
        const regex = new RegExp(/^\d+(\.\d+)?$/);
        if (!regex.test(value)) {
            okiDoki = false;
            inputCmp.setCustomValidity(`Invalid Input`);
        }
        if (value.indexOf('.') !== -1) {//contains decimal
            const numberOfDecimals = value.split('.')[1].length;
            numberOfIntegers = value.split('.')[0].length;
            if (currentValueLength > this.maxLength + 1) {
                okiDoki = false;
                inputCmp.setCustomValidity(`max: ${this.maxLength}, current: ${currentValueLength - 1}`);
            } else if (numberOfDecimals > this._maximumDecimals) {
                okiDoki = false;
                inputCmp.setCustomValidity(`decimalsAllowed: ${this.maximumDecimals}, current: ${numberOfDecimals}`);
            }
        } else if (currentValueLength > this.maxLength) {
            okiDoki = false;
            inputCmp.setCustomValidity(`max: ${this.maxLength}, current: ${currentValueLength}`);
        }
        if (okiDoki) {
            inputCmp.setCustomValidity(""); // if there was a custom error before, reset it
        }
        inputCmp.reportValidity();
        return okiDoki;
    }
    maxLength = 18;
    maximumIntegers = 18;
    _maximumDecimals = 17;
    get maximumDecimals() {
        return this._maximumDecimals;
    }
    set maximumDecimals(value) {
        if (value === undefined) value = 0;
        if (value !== 0 && value >= this.maxLength) {
            value = this.maxLength - 1;
        }
        this._maximumDecimals = value;
    }

    get additionalFields() {
        if (this.searchByApiName) {
            return [
                { fieldName: 'Profile.Name'},
            ];
        }
    }
    get expandedViewColumns() {
        if (this.searchByApiName) {
            return [
                { fieldName: this.searchByApiName },
                { fieldName: 'Profile.Name' },
            ];
        }
    }
    handleSelectedLookup(event) {
        if (!this.multipleSelected) {
            this.throwEvent(false);
        }
    }
    @api preValue;
    // @api
    // get preValue() {
    //     return this._preValue;
    // }
    // set preValue(preValue) {
    //     this.setAttribute('preValue', preValue);
    //     this._preValue = preValue;
    // }
}