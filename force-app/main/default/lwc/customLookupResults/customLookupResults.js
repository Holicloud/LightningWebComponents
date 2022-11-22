import { LightningElement, api } from 'lwc';

export default class CustomLookupResults extends LightningElement {
    @api fields;
    @api iconName;
    @api record;
    @api searchKey;

    get primaryField() {
        return this.fields.find(e => e.primary).fieldName.toUpperCase().replace('.', '_');
    }

    get primaryFieldDisplayableValue() {
        if (this.primaryField && this.record) {
            const value = this.record[Object.getOwnPropertyNames(this.record)
				.find(field => field.toUpperCase() === this.primaryField)];
			return this.searchKey ? this.boldOcurrences(this.searchKey, value) : value;
        }
    }

    handleRecordSelect() {
        this.dispatchEvent(new CustomEvent('select', { detail: this.record.Id }));
    }

    get extraFields() {

        let finalString = '';
        let labelsMap = new Map();
        const searchableFields = this.fields
			.filter(e => e.searchable)
			.map(element => element.fieldName.toLowerCase().replace('.','_'));

        if (this.record && this.fields) {

            for (const field of this.fields) {
                labelsMap.set(field.fieldName, field.label);
            }

            for (const field of Object.getOwnPropertyNames(this.record)) {

                if (labelsMap && [...labelsMap.keys()].includes(field) && field !== this.primaryField) {

					debugger
					finalString += this.searchKey && searchableFields.includes(field.toLowerCase())
						? `${labelsMap.get(field)}:${this.boldOcurrences(this.searchKey, this.record[field])}</br>`
						: `${labelsMap.get(field)}:${this.record[field]}</br>`;
                }
            }
        }

		debugger
        return finalString;
    }

    boldOcurrences(searchKey, myValue) {
        let preservedValue = myValue;
        let innerSearchKey = searchKey.toUpperCase();
        let innerMyValue = myValue.toUpperCase();
        let indexOfItemFound = innerMyValue.indexOf(innerSearchKey);
        const ocurrences = [];

        while (indexOfItemFound !== -1) {
            const ocurrence = myValue.substring(indexOfItemFound, indexOfItemFound + searchKey.length);
            myValue = myValue.substring(myValue.indexOf(ocurrence) + searchKey.length);

            if (!ocurrences.includes(ocurrence)) {
                ocurrences.push(ocurrence);
            }

            innerSearchKey = searchKey.toUpperCase();
            innerMyValue = myValue.toUpperCase();
            indexOfItemFound = innerMyValue.indexOf(innerSearchKey);
        }

        for (const ocurrence of ocurrences) {
            preservedValue = preservedValue.split(ocurrence).join('<mark>' + ocurrence + '</mark>');
        }

        return `<span>${preservedValue}</span>`;
    }
}