import { LightningElement } from 'lwc';
import { showToastError } from 'c/commonFunctionsHelper';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomLookupSample extends LightningElement {
    iconName = 'standard:contact';

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
            const newFieldsValue =
                this.template.querySelector('lightning-textarea, [data-id="fields"]');
            this.fields =JSON.parse(newFieldsValue.value), null, 2;
        } catch (error) {
            showToastError.call(this, 'JSON is invalid');
        }

        this.iconName = this.template.querySelector('lightning-input, [data-id="icon"]').value;
    }
}