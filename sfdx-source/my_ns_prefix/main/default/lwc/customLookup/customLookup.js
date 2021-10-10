/* eslint-disable no-eval */
/* eslint-disable vars-on-top */

import { LightningElement, track, api,wire } from 'lwc';
import findRecords from '@salesforce/apex/CustomDataTableController.findRecords';
import { buildQuery, getApexFields, formatColumns} from 'c/customDataTableHelper';
import { getObjectInfo} from 'lightning/uiObjectInfoApi';
import { flattenRecords, copyRecordsIntoNewArray, isBlank, showApexErrorMessage} from 'c/commonFunctionsHelper';

const DELAY = 800;
export default class CustomLookup extends LightningElement {
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
    _objectApiName;
    @api objectApiName = 'Account';
    /**
     * @type {string}
     * @default 'Account'
     * @example 'Select Account Record:'
     */
    _label;
    @api
    get label(){
        return this._label;
    }
    set label(label) {
        if (label) {
            label = label.trim();
        } else {
            label = 'Account';
        }
        this._label = label;
        this.setAttribute('label', label);
    }
    /**
     * @type {string}
     * @default ''
     * @example '001xa000003DIlo'
     */
    _preValue;
    @api
    get preValue() {
        return this._preValue;
    }
    set preValue(preValue) {
        this._preValue = preValue;
    }
    /**
     * @description soql where clause, it does not allow  "limit" && "order by"
     * @type {string}
     * @default ''
     * @example "Status__c IN ('Active','Exchanged-Active') AND IN IN ('0015E00000qlMtLQAE','0015E00000qlMtLQAU','0015E00000qlMtLQAC')"
     */
    _whereClause;
    @api
    get whereClause() {
        return this._whereClause;
    }
    set whereClause(whereClause) {
        if (!isBlank(whereClause)) {
            whereClause = whereClause.trim();
        } else {
            whereClause = '';
        }
        this._whereClause = whereClause;
        this.setAttribute('whereClause', whereClause);
    }
    /**
     * @description requires the input
     * @type {boolean}
     * @default false
     */
    @api required = false; // false by default
    /**
     * @description api name of the main field that the input will use to search records
     * @type {string}
     * @default 'Name'
     * @example "AnotherName__c"
     */
    _searchByApiName;
    @api
    get searchByApiName() {
        return this._searchByApiName;
    }
    set searchByApiName(searchByApiName) {
        if (searchByApiName) {
            searchByApiName = searchByApiName.trim().toUpperCase();
        } else {
            searchByApiName = 'NAME';
        }
        this.setAttribute('searchByApiName', searchByApiName);
        this._searchByApiName = searchByApiName;
    }
    /**
     * @description limit the amount of records displayed by the lookup
     * @type {string}
     * @default '10'
     * @example "20"
     */
    _limitOfRecords;
    @api
    get limitOfRecords() {
        return this._limitOfRecords;
    }
    set limitOfRecords(limitOfRecords) {
        if (!isBlank(limitOfRecords)) {
            limitOfRecords.trim();
            if (parseInt(limitOfRecords, 10) > 99) limitOfRecords = '99';
            if(isBlank(limitOfRecords)) limitOfRecords = '';
        } else {
            limitOfRecords = "10";
        }
        this.setAttribute('limitOfRecords', limitOfRecords);
        this._limitOfRecords = limitOfRecords;
    }
    /**
     * @description fields that will be shown by the lookup, 'ApiName:as:YourLabel', :as: value is optional and if not used it will display the fieldName of the field
     * @type {Array<any>}
     * @default
     * [
            { label: 'Nombre', fieldName: 'Name' },
            { label: 'LastName', fieldName: 'LastName' },
            { label: 'FirstName', fieldName: 'FirstName' },
            { label: 'RecordType', fieldName: 'RecordType.Name' }
        ];
     */
    _additionalFields = [
        { label: 'Nombre', fieldName: 'Name' },
        { label: 'LastName', fieldName: 'LastName' },
        { label: 'FirstName', fieldName: 'FirstName' },
        { label: 'RecordType', fieldName: 'RecordType.Name' }
    ];
    @api
    get additionalFields() {
        return this._additionalFields;
    }
    set additionalFields(additionalFields) {
        this.setAttribute('additionalFields', additionalFields);
        this._additionalFields = additionalFields;
    }
    queryApexFields;

    /**
     * @description prevent any input from being modified, use along with prevalue to have a prepopulated value that cant be modified by the user
     * @type {boolean}
     * @default false
     * @example true,false
     */
    @api disabled = false;
    /**
     * @description it displays a label with a sample of the expected input you are expecting users will put
     * @type {string}
     * @example 'ejemplo:  SAMPLENAME'
     */
    @api helpText;
    /**
     * @description it displays a small icon which can be used to display helpful information  to your users
     * @type {string}
     * @default 'searching by: searchByApiName,additionalSearchByFields'
     * @example 'type anything you want here'
     */
    @api helpfulInformation;

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
            if (expandedViewColumns && this.searchByApiName) {
                expandedViewColumns = this.pushColumnToSelect([...expandedViewColumns],this.searchByApiName);
                this._expandedViewColumns = expandedViewColumns;
                this.setAttribute('expandedViewColumns', expandedViewColumns);
            }
        };
        run();
    }
    pushColumnToSelect(expandedViewColumns, searchByApiName) {
        expandedViewColumns.unshift({
            type: 'button',
            fieldName: searchByApiName,
            typeAttributes: {
                label: {
                    fieldName: searchByApiName
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
    /**
     * @description lookup will display anyrecord that searchkey matches with given fields (searchByApiNameField like  '%searchkey%' OR aditionalField1 like '%searchkey% OR aditionalField2 like '%searchkey%')
     * @type {string}
     * @default ''
     * @example 'Product.Name,YourCustomObject__c.Name' ApiNames of aditional fields to search
     */
    @track _additionalSearchByFields = '';
    @api
    get additionalSearchByFields() {
        return this._additionalSearchByFields;
    }
    set additionalSearchByFields(additionalSearchByFields) {
        if (additionalSearchByFields) {
            additionalSearchByFields = additionalSearchByFields.trim().toUpperCase();
        } else {
            additionalSearchByFields = '';
        }
        this.setAttribute('additionalSearchByFields', additionalSearchByFields);
        this._additionalSearchByFields = additionalSearchByFields;
    }
    /** submits the lookup, if there is no record selected and the lookup is required it displays a required message*/
    @api submit() {
        if (this.required && this.recordSelected === undefined || this.recordSelected === null) {
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
        const mainInput = [...this.template.querySelectorAll('input')].find(element => element.name === 'mainInput');
        mainInput.value = '';
        this.searchKey = '';
        this.recordSelected = undefined;
        this.records = undefined;
        this.copyRecords = undefined;
        const theEvent = new CustomEvent('removed');
        this.setFocusInSearchField();
        this.displaySearchResults(true);
        this.dispatchEvent(theEvent);
    }
    /** @type {Array} */
    @track records;
    /** @type {String} */
    @track error;
    /** @type {String} */
    @track searchKey;
    /** @type {Array} */
    @track copyRecords = [];
    /** @type {string} */
    @track searchLabel;
    /** @type {boolean} */
    @track displaySearchIcon;
    /** @type {boolean} @default false */
    @track displayHelpfulInformation = false;
    /** @type {object} single record */
    @track recordSelected;
    /** @type {boolean} @default false*/
    @track showSpinner = false;
    /** @type {string}*/
    @track resultClass;
    /** @type {string} */
    @track requiredClass;
    /** @type {boolean}*/
    @track displayRequiredMessage;

    @api
    get apiRecordSelected() {
        return this.recordSelected;
    }
    set apiRecordSelected(apiRecordSelected) {
        this.recordSelected = apiRecordSelected;
    }

    /** @type {string} */
    objectLabel;

    get copyRecordsIsOk() {
        return this.copyRecords !== undefined && this.copyRecords.length > 0;
    }


    constructor() {
        super();
        this.searchKey = '';
        this.displaySearchResults(false);
        this.requiredClass = "slds-form-element";
    }

    connectedCallback() {
        let run = async () => {
            if (this.additionalFields) {
                if(this.objectApiName) {
                    this.additionalFields = await formatColumns(this.additionalFields, this.objectApiName);
                    this._expandedViewColumns = await formatColumns(this.expandedViewColumns, this.objectApiName);
                }
                this.queryApexFields = getApexFields(this.additionalFields);
            }
        };
        run();
    }

    renderedCallback() {
        this.prepopulatedValue();
    }


    /** checks if there a prepopulated value and if so populate the input*/
    prepopulatedValue() {
        if (!isBlank(this.preValue)) {
            let run = async () => {
                const theQuery = await buildQuery('1', this.objectApiName,'', this.preValue, this.queryApexFields, this.searchByApiName, '', this.whereClause, false, '');
                findRecords({
                    theQuery: theQuery
                }
                ).then(result => {
                    if (result.length > 0) {
                        this.displaySearch(false);
                        this.recordSelected = result[0];
                        this.submit();
                        this.throwEventSelected(this.recordSelected);
                    } else {
                        this.recordSelected = undefined;
                    }
                }).catch(error => {
                    if (error.body.message) {
                        this.dispatchEvent(showApexErrorMessage(error));;
                    }
                });
            };
            run();
        }
    }

    showHelpfulInformation() {
        this.displayHelpfulInformation = true;
    }
    hideHelpfulInformation() {
        this.displayHelpfulInformation = false;
    }
    /** displays expandedLookup */
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
                let run = async () => {
                    const theQuery = await buildQuery('20', this.objectApiName, '', '', this.queryApexFields, this.searchByApiName, this.searchKey, this.whereClause, false, this.additionalSearchByFields);
                    findRecords({
                        theQuery: theQuery
                    })
                        .then(result => {
                            this.displaySearch(true);
                            this.displaySearchResults(true);
                            const newArrayOfRecords = copyRecordsIntoNewArray(result);
                            this.records = flattenRecords(newArrayOfRecords); // return an array with the data flattened
                            this.searchLabel = `   "${this.searchKey}" in ${this.objectLabel} records`;
                            this.displaySearchIcon = true;
                            this.error = undefined;
                            this.showSpinner = false;
                        })
                        .catch(error => {
                            if (error.body.message) {
                                this.dispatchEvent(showApexErrorMessage(error));;
                            }
                        });

                };
                run();
            }, DELAY);
        } else {
            if (this.hideRecentRecords) {
                this.showGivenRecords();
            } else {
                this.showRecentRecords();
            }
            this.showSpinner = false;
        }
    }
    /** displays recent records if any */
    showRecentRecords() {
        if (isBlank(this.searchKey.trim())) {
            this.displaySearchResults(false);
            let run = async () => {
                const theQuery = await buildQuery(this.limitOfRecords, this.objectApiName, '', '', this.queryApexFields, this.searchByApiName, '', this.whereClause, true, this.additionalSearchByFields);
                findRecords({
                    theQuery: theQuery
                })
                    .then(result => {
                        if (result.length > 0) {
                            this.records = flattenRecords(copyRecordsIntoNewArray(result)); // return an array with the data flattened
                            this.displaySearchResults(true);
                            this.displaySearchIcon = false;
                            this.searchLabel = ` Recent ${this.objectLabel} records`;
                            this.error = undefined
                        }
                    })
                    .catch(error => {
                        if (error.body.message) {
                            this.dispatchEvent(showApexErrorMessage(error));;
                        }
                    });
            };
            run();
        }
    }

    /**  if hideRecentRecords is false displays where Clause records*/
    showGivenRecords() {
        let run = async () => {
            const theQuery = await buildQuery(this.limitOfRecords, this.objectApiName, '', '', this.queryApexFields, this.searchByApiName, '', this.whereClause, false, this.additionalSearchByFields);
            findRecords({
                theQuery: theQuery
            })
                .then(result => {
                    if (result.length > 0) {
                        this.records = flattenRecords(copyRecordsIntoNewArray(result)); // return an array with the data flattened
                        this.displaySearchResults(true);
                        this.displaySearchIcon = false;
                        this.searchLabel = ` View All ${this.objectLabel} results`;
                        this.error = undefined
                    }
                })
                .catch(error => {
                    if (error.body.message) {
                        this.dispatchEvent(showApexErrorMessage(error));;
                    }
                });
        };
        run();
    }
    /**
     * @type {string} searchByDisplayableValue
     */
    @track searchByDisplayableValue;
    /**
     * @param  {any} recordSelected - event.detail has to be the ID of the record selected
     */
    handleSelect(recordSelected) {
        const recordId = recordSelected.detail;
        this.recordSelected = this.records.find(record => recordId === record.Id);
        this.throwEventSelected(this.recordSelected);
    }
    /**
     * @param  {any} recordSelected - event.detail has to be the ID of the record selected
     */
    throwEventSelected(recordSelected) {
        this.displaySearch(false);
        this.searchByDisplayableValue = recordSelected[Object.getOwnPropertyNames(recordSelected).find(property => property.toUpperCase() === this.searchByApiName.replace('.', '_'))];
        this.submit();
        this.dispatchEvent(new CustomEvent("selected", { detail: recordSelected }));
    }

    @api setFocusInSearchField() {
        const mainInput = [...this.template.querySelectorAll('input')].find(element => element.name === 'mainInput');
        mainInput.focus();
    }
    /** @param  {boolean} on - shows/hides lookupresults */
    displaySearchResults(on) {
        this.resultClass = on
            ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open'
            : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-close';
    }
    /** @param  {boolean} on - shows/hides searchInputField  */
    displaySearch(on) {
        var theDiv = [...this.template.querySelectorAll('div')].find(element => [...element.classList].includes("search-class"));
        if (on) {
            theDiv.classList.remove('modal-hidden');
        } else {
            theDiv.classList.add('modal-hidden');
        }
    }
    displayExpandedLookup(display) {
        const popUp = this.template.querySelector('[data-id="thePopUp"]');
        if (display) {
            popUp.display();
        } else {
            popUp.hide();
        }
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
    @api get selectedRecord() {
        return this.recordSelected;
    }
}