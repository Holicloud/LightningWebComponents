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

        const fields = JSON.parse(JSON.stringify(this.fields)).map(e => {
            e.fieldName = e.fieldName.replace('.','_')
            return e;
        });

        const searchableFields = new Set(
            fields.filter(e => e.searchable).map(e => e.fieldName));

        if (!this.record || !fields) return finalString;

        const labelByField = new Map(fields.map(field => [field.fieldName, field.label]));

        for (const field of Object.getOwnPropertyNames(this.record)) {

            if (labelByField.has(field) && field !== this.primaryField) {
                const value = this.searchKey && searchableFields.has(field)
                    ? this.boldOcurrences(this.searchKey, this.record[field])
                    : this.record[field];
                finalString += `${labelByField.get(field)}: ${value}</br>`;
            }
        }

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