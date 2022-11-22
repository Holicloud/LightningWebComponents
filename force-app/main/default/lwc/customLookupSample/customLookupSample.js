import { LightningElement } from 'lwc';

export default class CustomLookupSample extends LightningElement {
	fields = [
        { label: 'Name', fieldName: 'Name' , primary: true },
        { label: 'Phone', fieldName: 'Phone', searchable: true },
        { label: 'AccountNumber', fieldName: 'AccountNumber', searchable: true },
        { label: 'Owner', fieldName: 'Owner.Name', searchable: true }
    ];
	iconName = 'standard:account';
}