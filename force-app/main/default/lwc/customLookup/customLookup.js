/* eslint-disable no-eval */
/* eslint-disable vars-on-top */

import { LightningElement, track, api,wire } from 'lwc';
import { formatColumns} from 'c/customDataTableHelper';
import getRecords from '@salesforce/apex/CustomLookupController.getRecords';
import { getObjectInfo} from 'lightning/uiObjectInfoApi';
import { flattenRecords, cloneArray, isBlank, showToastError, showToastApexError } from 'c/commonFunctionsHelper';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const DELAY = 800;
export default class CustomLookup extends LightningElement {
    /**
     * @description help text information about the lookup
     * @type {string}
     * @example 'select your account'
     */
    @api bottomText;

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
    @api preValue;

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

    /**
     * @description prevent any input from being modified, use along with prevalue to have a prepopulated value that cant be modified by the user
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
     * @description same as https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation but supports object relationships
     * @type {Array<any>}
     * @default [ { label: 'Nombre', fieldName: 'Name' }, { fieldName: 'LastName' }, { fieldName: 'FirstName' }, { label: 'Recordtype', fieldName: 'RecordType.Name' } ]
     * @example
     */
    //  =[{ label: 'Nombre', fieldName: 'Name' }, { fieldName: 'LastName' }, { fieldName: 'FirstName' }, { label: 'Recordtype', fieldName: 'RecordType.Name' }]
    _expandedViewColumns;
    @api
    get expandedViewColumns() {
        return this._expandedViewColumns;
    }
    set expandedViewColumns(expandedViewColumns) {
        let run = async () => {
            if (expandedViewColumns && this.searchBy) {
                expandedViewColumns = this.pushColumnToSelect([...expandedViewColumns] , this.searchBy[0]);
                this._expandedViewColumns = expandedViewColumns;
                this.setAttribute('expandedViewColumns', expandedViewColumns);
            }
        };
        run();
    }

    pushColumnToSelect(expandedViewColumns, searchBy) {

        expandedViewColumns.unshift({
            type: 'button',
            fieldName: searchBy,
            typeAttributes: {
                label: {
                    fieldName: searchBy
                },
                title: 'Select',
                variant: 'base',
            },
            sortable: true,
            cellAttributes: { alignment: 'center' }
        });

        return expandedViewColumns;
    }

    /**
     * @description limit the amount of records displayed by the lookup
     * @type {string}
     * @default '20' (set on c-expanded-list-view-custom-lookup child component)
     * @example "20"
     */
    @api limitOfRecordsExpandedLookup = '20';

    /**
     * @description choose what to display when the searchkey is empty
     * @type {boolean}
     * @default 'false' displays recent records
     * @example 'true' displays queried records from the whereclause without including searchkey
     */
    @api hideRecentRecords = false;

    /** submits the lookup, if there is no record selected and the lookup is required it displays a required message*/
    @api submit() {
        if (this.required && !this.recordSelected) {
            this.requiredClass = 'slds-form-element slds-has-error';
            this.displayRequiredMessage = true;
        } else {
            this.requiredClass = 'slds-form-element';
            this.displayRequiredMessage = false;
        }
    }

    @api handleRemove() {
        this.submit();
        this.preValue = undefined;
        this.displaySearch(true);
        this.template.querySelector('[data-id="input"]').value = '';
        this.searchKey = '';
        this.recordSelected = undefined;
        this.records = undefined;
        this.staleRecords = undefined;
        const theEvent = new CustomEvent('removed');
        this.setFocusInSearchField();
        this.displaySearchResults(true);
        this.dispatchEvent(theEvent);
    }

    @api get selectedRecord() {
        return this.recordSelected;
    }

    /** @type {Array} */
    @track records;

    /** @type {String} */
    @track staleRecords = [];
	
    /** @type {string} */
	@track recordSelected;

    /** @type {boolean} @default false*/
    error;

    /** @type {String} */
    searchKey;

    /** @type {Array} */
    searchLabel;

    /** @type {boolean} */
    displaySearchIcon;

    /** @type {object} single record */
    showSpinner = false;

    /** @type {string}*/
    resultClass;

    /** @type {string} */
    requiredClass;

    /** @type {boolean}*/
    displayRequiredMessage;

	/** @type {string} */
	objectLabel;

    get copyRecordsIsOk() {
        return this.staleRecords !== undefined && this.staleRecords.length > 0;
    }

    constructor() {
        super();
        this.searchKey = '';
        this.displaySearchResults(false);
        this.requiredClass = "slds-form-element";
    }

    async connectedCallback() {
        if (this.fields && this.objectApiName) {
            // this.fields = await formatColumns(this.fields, this.objectApiName);
            // this.fields.map(e => e.fieldName) = this.fields.map(e => e.fieldName);
        }
    }

    renderedCallback() {
        this.prepopulatedValue();
    }

    prepopulatedValue() {
		if (isBlank(this.preValue)) return;

		getRecords({ queryParameters : JSON.stringify({
			objectApiName : this.objectApiName,
			preValue : this.preValue,
			queryFields : this._fields.map(e => e.fieldName),
			searchByApiName : this.searchByApiName,
			searchByFields : this.searchBy,
			whereClause : this.whereClause,
		})})
		.then(result => {
			if (result.length) {
				this.displaySearch(false);
				this.recordSelected = result[0];
				this.submit();
				this.throwEventSelected(this.recordSelected);
			} else {
				this.recordSelected = undefined;
			}
		})
		.catch(error => {
            showToastApexError.call(this, error);
        });
    }

    openExpandedLookup() {
        this.displayExpandedLookup(true);
    }

    /** on search input blur submit the lookup and hide lookup search results */
    inblur() {
        if (!/Edge\/\d./i.test(navigator.userAgent)){
            this.submit();
            this.displaySearchResults(false);
        }
    }

    inblurEdge() {
        // This is for Microsoft Edge
        if (/Edge\/\d./i.test(navigator.userAgent)){
            this.submit();
            this.displaySearchResults(false);
        }
    }

    /** @param  {any} event - the search input onfocus event*/
    handleOnFocus(event) {
        this.handleOnchange(event);
    }

    /** @param  {any} event - event.target.value has to be the searchkey input*/
    handleOnchange(event) {
        event.preventDefault();
        window.clearTimeout(this.delayTimeout);
        this.searchKey = event.target.value.trim();
        this.showSpinner = true;
        this.displaySearchResults(false);
        if (!isBlank(this.searchKey)) {
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
					this.displaySearch(true);
					this.displaySearchResults(true);
					this.records = flattenRecords(cloneArray(result));
					this.searchLabel = `   "${this.searchKey}" in ${this.objectLabel} records`;
					this.displaySearchIcon = true;
					this.error = undefined;
				})
				.catch(error => showToastApexError.call(this, error))
                .finally(() => this.showSpinner = false);
            }, DELAY);
        } else {
			this.hideRecentRecords ? this.showGivenRecords() : this.showRecentRecords();
            this.showSpinner = false;
        }
    }

    showRecentRecords() {
		this.displaySearchResults(false);

		getRecords({ queryParameters : JSON.stringify({
			limitOfRecords : this.limitOfRecords,
			objectApiName : this.objectApiName,
			queryFields : this._fields.map(e => e.fieldName),
			displayRecentlyViewed: true,
			whereClause : this.whereClause,
		})})
		.then(result => {
			if (result.length > 0) {
				this.records = flattenRecords(cloneArray(result));
				this.displaySearchResults(true);
				this.displaySearchIcon = false;
				this.searchLabel = ` Recent ${this.objectLabel} records`;
				this.error = undefined
			}
		})
		.catch(error => showToastApexError.call(this, error));
    }

    showGivenRecords() {
		getRecords({ queryParameters : JSON.stringify({
			limitOfRecords : this.limitOfRecords,
			objectApiName : this.objectApiName,
			queryFields : this._fields.map(e => e.fieldName),
			whereClause : this.whereClause,
		})})
		.then(result => {
			if (result.length > 0) {
				this.records = flattenRecords(cloneArray(result));
				this.displaySearchResults(true);
				this.displaySearchIcon = false;
				this.searchLabel = ` View All ${this.objectLabel} results`;
				this.error = undefined
			}
		})
		.catch(error => showToastApexError.call(this, error));
    }

    /**
     * @param  {any} recordSelected - event.detail has to be the ID of the record selected
     */
    handleSelect(event) {
        this.recordSelected = this.records.find(record => event.detail === record.Id);

        if (this.recordSelected) {
            this.throwEventSelected(this.recordSelected);
        }
    }

    /**
     * @param  {any} recordSelected - event.detail has to be the ID of the record selected
     */
    throwEventSelected(recordSelected) {
        this.displaySearch(false);
        this.primaryFieldDisplayableValue = recordSelected[
			Object.getOwnPropertyNames(recordSelected)
				.find(property => property.toUpperCase() === this.primaryField)];
        this.submit();
        this.dispatchEvent(new CustomEvent("selected", { detail: recordSelected }));
    }

	get primaryField() {
        return this._fields.find(e => e.primary).fieldName.toUpperCase().replace('.', '_');
    }

    setFocusInSearchField() {
        setTimeout(() => {
            this.template.querySelector('[data-id="input"]').focus();
        }, 0);
    }

    /** @param  {boolean} on - shows/hides lookupresults */
    displaySearchResults(on) {
        this.resultClass =
            `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-${on ? 'open' : 'close'}`;
    }

    /** @param  {boolean} on - shows/hides searchInputField  */
    displaySearch(on) {
        this.template.querySelector('.search-class').classList[on ? 'remove' : 'add']('modal-hidden');
    }

    displayExpandedLookup(display) {
        this.template.querySelector('[data-id="thePopUp"]')[display ? 'display' : 'hide']();
    }


    /** get LabelName given and objectApiName*/
    get thePlaceHolder() {
        if (this.objectLabel) {
            return `Search ${this.objectLabel} records...`;
        }
    }

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    handleGetInfo({ data, error }) {
        if (data) {
            this.objectLabel = data.label;
        } else if (error) {
            this.objectLabel = undefined;
        }
    }

    /** @param  {any} event - event.detail has to be the searchkey */
    handleCancelModal(event) {
        this.searchKey = event.detail;
        this.setFocusInSearchField();
    }

    /** @param  {any} event - event.detail.detail.detail.row has to be the recordSelected object */
    handleRowAction(event) {
        this.displayExpandedLookup(false);
        this.recordSelected = event.detail.detail.row;
        this.throwEventSelected(this.recordSelected);
    }
}