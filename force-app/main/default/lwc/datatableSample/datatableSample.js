import { LightningElement, api } from 'lwc';
import { showToastError } from 'c/commonFunctionsHelper';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomLookupSample extends LightningElement {
    @api flexipageRegionWidth;
    limitOfRecords = 50;

    fields = [
        { label: 'Name', fieldName: 'Name', primary: true },
        { label: 'Phone', fieldName: 'Phone', searchable: true },
        { label: 'AccountNumber', fieldName: 'AccountNumber', searchable: true },
        { label: 'Owner', fieldName: 'Owner.Name', searchable: true }
    ];

    get displayFields() {
        return JSON.stringify(this.fields, null, 2)
    }

    handleUpdateParameters() {
        try {
            const newFieldsValue = this.getElementByDataId('fields');
            this.fields =JSON.parse(newFieldsValue.value), null, 2;
        } catch (error) {
            showToastError.call(this, 'JSON is invalid');
        }

        this.limitOfRecords = this.getElementByDataId('limitOfRecords').value;
    }

    getElementByDataId(dataId) {
        return this.template.querySelector(`[data-id="${dataId}"]`);
    }
}