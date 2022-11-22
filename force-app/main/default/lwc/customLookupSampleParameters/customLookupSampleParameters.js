import { LightningElement, api } from 'lwc';

export default class CustomLookupSampleParameters extends LightningElement {
	@api iconName;
	@api fields = JSON.stringify([
        { label: 'Name', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone' },
        { label: 'AccountNumber', fieldName: 'AccountNumber' },
        { label: 'Owner', fieldName: 'Owner.Name' }
    ], null, 2);

	handleFieldsChange() {
		this.fields = JSON.stringify(JSON.parse(this.fields), null, 2);
	}
}