/* eslint-disable no-eval */
/* eslint-disable vars-on-top */

import { LightningElement, track, api,wire } from 'lwc';
import getRecords from '@salesforce/apex/LookupController.getRecords';
import { getObjectInfo} from 'lightning/uiObjectInfoApi';
import { flattenRecords, cloneArray, isBlank, showToastError, showToastApexError } from 'c/commonFunctionsHelper';

const DELAY = 800;
export default class Lookup extends LightningElement {
    /**
     * @type {string}
     * @example 'custom:device'
     * @default 'standard:account'
     */
    @api iconName = "standard:account";

    /**
     * @type {string}
     * @example 'CustomObject__c'
     * @default 'Account'
     */
    @api objectApiName = 'Account';

    /**
     * @type {string}
     * @default 'Account'
     * @example 'Select Account Record:'
     */
    @api label;

    /**
     * @type {string}
     * @default ''
     * @example '001xa000003DIlo'
     */
    @api value;

    /**
     * @description soql where clause, it does not allow  "limit" && "order by"
     * @type {string}
     * @default ''
     * @example "Status__c IN ('Active','Exchanged-Active') AND IN IN ('0015E00000qlMtLQAE','0015E00000qlMtLQAU','0015E00000qlMtLQAC')"
     */
    @api whereClause;

    /**
     * @description requires the input
     * @type {boolean}
     * @default false
     */
    @api required = false;

    /**
     * @description limit the amount of records displayed by the lookup
     * @type {integer}
     * @default '10'
     * @example "20"
     */
    @api limitOfRecords = 10;

    /**
     * @description prevent any input from being modified, use along with value to have a prepopulated value that cant be modified by the user
     * @type {boolean}
     * @default false
     */
    @api disabled = false;

    /**
     * @description it displays a small icon which can be used to display helpful information  to your users
     * @type {string}
     * @default 'searching by: searchBy'
     * @example 'type anything you want here'
     */
    @api helpText;

    /**
     * @description choose what to display when the searchkey is empty
     * @type {boolean}
     * @default 'false' displays recent records
     * @example 'true' displays queried records from the whereclause without including searchkey
     */
    @api hideRecentRecords = false;

    /** @type {Array} */
    @track records;

    /** @type {string} */
	@track recordSelected;

    /** @type {String} */
    searchKey = '';

    /** @type {Array} */
    searchLabel;

    /** @type {boolean} */
    displaySearchIcon;

    /** @type {object} single record */
    showSpinner = false;

    /** @type {boolean}*/
    displayRequiredMessage;

	/** @type {string} */
	objectLabel;

    /**
     * @description fields that will be shown by the lookup
     * @type {Array<any>}
     */
    _fields = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone' },
        { label: 'AccountNumber', fieldName: 'AccountNumber' },
        { label: 'Owner', fieldName: 'Owner.Name' }
    ];

    @api
    get fields() {
        return this._fields;
    }
    set fields(value) {
        if (value && !Array.isArray(value)) {
            showToastError.call(this, 'fields should be an array')
        }  
        this._fields = value;
    }

    @api get selectedRecord() {
        return this.recordSelected;
    }

    /** submits the lookup, if there is no record selected and the lookup is required it displays a required message*/
    @api submit() {
        const form = this.template.querySelector('.slds-form-element');
        if (this.required && !this.recordSelected) {
            form.classList.add('slds-has-error');
            this.displayRequiredMessage = true;
        } else {
            form.classList.remove('slds-has-error');
            this.displayRequiredMessage = false;
        }
    }

    @api remove() {
        this.submit();
        this.value = null;
        this.searchKey = '';
        this.recordSelected = null;
        this.records = null;
        this.setFocusInSearchField();
        this.dispatchEvent(new CustomEvent('removed'));
    }

    async renderedCallback() {
        await this.showValue();
    }

    async showValue() {

		if (isBlank(this.value)) return;

		try {
            const result = await getRecords({
                queryParameters: JSON.stringify({
                    objectApiName: this.objectApiName,
                    value: this.value,
                    queryFields: this._fields.map(e => e.fieldName),
                    searchByFields: this.searchBy,
                    whereClause: this.whereClause,
                })});
            result.length ? this.throwEventSelected(result[0]) : this.recordSelected = null;
        } catch (error) {
            return showToastApexError.call(this, error);
        }
    }

    openExpandedLookup() {
        this.displayExpandedLookup(true);
    }

    /** @param  {any} event - the search input onfocus event*/
    handleOnFocus(event) {
        this.handleOnchange(event);
    }

    /** @param  {any} event - event.target.value has to be the searchkey input*/
    async handleOnchange(event) {
        event.preventDefault();
        window.clearTimeout(this.delayTimeout);
        this.searchKey = event.target.value.trim();
        this.showSpinner = true;

        if (isBlank(this.searchKey)) {
            await this[this.hideRecentRecords ? 'showAllRecords' : 'showRecentRecords']();
            this.showSpinner = false;
            return;
        }

        this.delayTimeout = setTimeout(() => {
            getRecords({ queryParameters : JSON.stringify({
                limitOfRecords : this.limitOfRecords,
                objectApiName : this.objectApiName,
                queryFields : this._fields.map(e => e.fieldName),
                searchKey : this.searchKey,
                searchByFields : this._fields.filter(e => e.searchable || e.primary).map(e => e.fieldName),
                whereClause : this.whereClause,
            })})
            .then(result => {
                this.records = flattenRecords(cloneArray(result));
                this.searchLabel = `   "${this.searchKey}" in ${this.objectLabel} records`;
                this.displaySearchIcon = true;
                this.error = null;
            })
            .catch(error => showToastApexError.call(this, error))
            .finally(() => this.showSpinner = false);
        }, DELAY);
    }

    async showRecentRecords() {

		try {
            const result = await getRecords({
                queryParameters: JSON.stringify({
                    limitOfRecords: this.limitOfRecords,
                    objectApiName: this.objectApiName,
                    queryFields: this._fields.map(e => e.fieldName),
                    displayRecentlyViewed: true,
                    whereClause: this.whereClause,
                })
            });
            if (result.length) {
                this.records = flattenRecords(cloneArray(result));
                this.displaySearchIcon = false;
                this.searchLabel = ` Recent ${this.objectLabel} records`;
                this.error = null;
            }
        } catch (error) {
            return showToastApexError.call(this, error);
        }
    }

    async showAllRecords() {
		try {
            const result = await getRecords({
                queryParameters: JSON.stringify({
                    limitOfRecords: this.limitOfRecords,
                    objectApiName: this.objectApiName,
                    queryFields: this._fields.map(e => e.fieldName),
                    whereClause: this.whereClause,
                })
            });
            if (result.length) {
                this.records = flattenRecords(cloneArray(result));
                this.displaySearchIcon = false;
                this.searchLabel = ` View All ${this.objectLabel} results`;
                this.error = null;
            }
        } catch (error) {
            return showToastApexError.call(this, error);
        }
    }

    /**
     * @param  {any} recordSelected - event.detail has to be the ID of the record selected
     */
    handleSelect(event) {
        this.throwEventSelected(this.records.find(record => event.detail === record.Id));
    }

    /**
     * @param  {any} recordSelected - event.detail has to be the ID of the record selected
     */
    throwEventSelected(recordSelected) {
        if (recordSelected) {
            this.inputValue = recordSelected[
                Object.getOwnPropertyNames(recordSelected)
                    .find(property => property.toUpperCase() === this.primaryField)];
            this.recordSelected = recordSelected;
            this.dispatchEvent(new CustomEvent("selected", { detail: recordSelected }));
            this.submit();
        }
    }

	get primaryField() {
        return this._fields.find(e => e.primary).fieldName.toUpperCase().replace('.', '_');
    }

    setFocusInSearchField() {
        setTimeout(() => this.template.querySelector('[data-id="input"]').focus(), 0);
    }

    get inputPlaceHolder() {
        return `Search ${this.objectLabel || ''} records...`;
    }

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    handleGetInfo({ data, error }) {
        if (data) {
            this.objectLabel = data.label;
        } else if (error) {
            this.objectLabel = null;
        }
    }
}