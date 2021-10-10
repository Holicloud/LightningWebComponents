import { LightningElement, api } from 'lwc';

export default class CustomLookupResults extends LightningElement {
    @api searchKey;
    @api record;
    @api iconName;
    @api labelsFieldsMap;
    @api additionalFields;
    @api additionalSearchByFields;
    _mainField;
    @api
    get mainField() {
        return this._mainField;
    }
    set mainField(mainField) {
        if (mainField) {
            mainField = mainField.toUpperCase().replace('.', '_');
        }
        this.setAttribute('mainField', mainField);
        this._mainField = mainField;
    }
    get mainFieldHighlighted() {
        if (this.mainField && this.record) {
            var mainProperty = Object.getOwnPropertyNames(this.record).find(field => field.toUpperCase() === this.mainField);
            if (this.searchKey) {
                return this.boldOcurrences(this.searchKey, this.record[mainProperty]);
            } else {
                return this.record[mainProperty];
            }
        }
    }
    handleRecordSelect() {
        const theEvent = new CustomEvent('select', {
            detail: this.record.Id
        });
        this.dispatchEvent(theEvent);
    }
    get extraFields() {
        let finalString = '';
        let labelsMap = new Map();
        const upperCaseAddSearchByFields = this.additionalSearchByFields.split(',').map(element => element.toUpperCase().replace('.','_'));
        if (this.record && this.additionalFields) {
            for (const additionalField of this.additionalFields) {
                labelsMap.set(additionalField.fieldName, additionalField.label);
            }
            for (const field of Object.getOwnPropertyNames(this.record)) {
                if (labelsMap && [...labelsMap.keys()].includes(field) && field !== this.mainField) {
                    if (this.searchKey && upperCaseAddSearchByFields.includes(field.toUpperCase())) {
                        finalString += `${labelsMap.get(field)}:${this.boldOcurrences(this.searchKey, this.record[field])}</br>`;
                    } else {
                        finalString += `${labelsMap.get(field)}:${this.record[field]}</br>`
                    }
                }
            }
        }
        return finalString;
    }

    boldOcurrences(searchKey, myValue) {
        var preservedValue = myValue;
        var innerSearchKey = searchKey.toUpperCase();
        var innerMyValue = myValue.toUpperCase();
        var keyLength = searchKey.length;
        var indexOfItemFound = innerMyValue.indexOf(innerSearchKey);
        var ocurrences = [];
        while (indexOfItemFound !== -1) {
            var theOcurrence = myValue.substring(indexOfItemFound, indexOfItemFound + keyLength);//get especific ocurrence
            myValue = myValue.substring(myValue.indexOf(theOcurrence) + keyLength);
            if (!ocurrences.includes(theOcurrence)) {
                ocurrences.push(theOcurrence);
            }
            innerSearchKey = searchKey.toUpperCase();
            innerMyValue = myValue.toUpperCase();
            indexOfItemFound = innerMyValue.indexOf(innerSearchKey);
        }
        for (theOcurrence of ocurrences) {
            preservedValue = preservedValue.split(theOcurrence).join('<mark>' + theOcurrence + '</mark>');
        }
        return `<span>${preservedValue}</span>`;
    }
}