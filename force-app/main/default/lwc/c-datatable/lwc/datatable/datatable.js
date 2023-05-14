/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/CustomDataTableController.getRecords';
// import getRecordsNonCacheable from '@salesforce/apex/CustomDataTableController.getRecordsNonCacheable';
import { formatColumns } from 'c/customDataTableHelper';
import { flattenRecords, cloneArray, showToastError, showToastApexError } from 'c/commonFunctionsHelper';

import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { publish, MessageContext, } from 'lightning/messageService'
import dataTableMessageChannel from '@salesforce/messageChannel/DataTable__c';
const DELAY = 800;
export default class Datatable extends LightningElement {
  @track state = {
    objectApiName : 'DataTest__c',
    records : [],
    limitOfRecords: 50,
    sortedBy: 'Currency__c',
    sortDirection: 'asc',
    hideCheckBoxColumn: false,
    recordTypeId: null,
    enableInfiniteLoading: false,
    loadMoreOffset: 20,
    minColumnWidth: 50,
    maxColumnWidth: 1000,
    columns : [
      { fieldName: 'Level1__c', editable: true },
      { fieldName: 'Level2__c', editable: true },
      { fieldName: 'Level3__c', editable: true },
      { fieldName: 'Level4__c', editable: true },
      { fieldName: 'RecordType.Name', label: 'Recordtype Name' },
      // { fieldName: 'Currency__c', editable: true },
      // { fieldName: 'Date__c', editable: true },
      // { fieldName: 'DateTime__c', editable: true },
      // { fieldName: 'Email__c', editable: true },
      // { fieldName: 'Lookup__c', editable: true },
      // { fieldName: 'MultiSelectPicklist__c', editable: true },
      // { fieldName: 'Number__c', editable: true },
      // { label: 'Owner', fieldName: 'Owner.Name', editable: true },
      // { fieldName: 'Percent__c', editable: true },
      // { fieldName: 'Phone__c' , editable: true },
      // { fieldName: 'TextArea__c', editable: true },
      // { fieldName: 'Text__c', editable: true },
      // { fieldName: 'Time__c', editable: true },
      // { fieldName: 'Url__c', editable: true },
    ]
  };

  subscription;

  totalNumberOfRecords;
  loadMoreStatus;
  staticRecords;

  @api defaultSortDirection = 'asc';

  showSpinner = true;
  queryOffSet = 0;

  @api
  get sortedBy() {
    return this.state.sortedBy;
  }

  set sortedBy(value) {
    this.state.sortedBy = value;
  }

  @api isLoading = false;

  @api
  get sortDirection() {
    return this.state.sortDirection;
  }

  set sortDirection(value) {
    this.state.sortDirection = value;
  }

  @api
  get enableInfiniteLoading() {
    return this.state.enableInfiniteLoading;
  }

  set enableInfiniteLoading(value) {
    this.state.enableInfiniteLoading = value;
  }

  @api
  get loadMoreOffset() {
    return this.state.loadMoreOffset;
  }

  set loadMoreOffset(value) {
    this.state.loadMoreOffset = value;
  }

  @api
  get minColumnWidth() {
    return this.state.minColumnWidth;
  }

  set minColumnWidth(value) {
    this.state.minColumnWidth = value;
  }

  @api
  get maxColumnWidth() {
    return this.state.maxColumnWidth;
  }

  set maxColumnWidth(value) {
    this.state.maxColumnWidth = value;
  }

  @api
  get hideCheckBoxColumn() {
    return this.state.hideCheckBoxColumn;
  }

  set hideCheckBoxColumn(value) {
    this.state.hideCheckBoxColumn = value;
  }

  @api
  get objectApiName() {
    return this.state.objectApiName;
  }

  set objectApiName(value) {
    this._wiredObjectApiName.objectApiName = value;
    this.state.objectApiName = value;
    // this.formatColumns();
  }

  @api
  get columns() {
    return this.state.columns;
  }

  set columns(value) {
    if (!value || !Array.isArray(value) || !value.length) {
      showToastError.call(this, `invalid value for columns ${JSON.stringify(value)}`);
      return;
    }

    this.state.columns = value;
    // this.formatColumns();
  }

  @api
  get limitOfRecords() {
    return this.state.limitOfRecords;
  }

  set limitOfRecords(value) {
    this.state.limitOfRecords = value;
  }

  async formatColumns() {
    const { columns, objectApiName } = this.state;
    if (columns && objectApiName && !this.formatColumnsHasRun)  {
      this.state.columns = await formatColumns({ objectApiName, columns });
      this.formatColumnsHasRun = true;
    } else {
      this.formatColumnsHasRun = false;
    }
  }

  get fields() {
    let result = new Set();

    for (const { apexFieldsReferenced } of this.state.columns) {
      for (const field of apexFieldsReferenced) {
        result.add(field);
      }
    }

    return [...result];
  }

  async showRecords() {
    // this.resetDraftedValues();
    const { limitOfRecords, objectApiName, sortedBy, sortDirection } = this.state;
    this.showSpinner = true;
    try {
      const result = await getRecords({ queryParameters : JSON.stringify({
          limitOfRecords,
          objectApiName: objectApiName,
          fields : this.fields,
          whereClause: `Id IN ('a018b00000yi4X6AAI',  'a018b00000yi4VeAAI') `,
          sortedBy,
          sortDirection
      })});
  
      if (result) {
        this.totalNumberOfRecords = result.totalRecordCount;
        const records = flattenRecords(cloneArray(result.records));
        this.staticRecords = [...records]; 
        this.state.records = records;
      }
      
    } catch (error) {
      showToastApexError.call(this, error);
      this.state.records = null;
      this.staticRecords = null; 
    }

    this.showSpinner = false
  }

  async connectedCallback() {
    await this.init();
    await this.formatColumns();
    await this.showRecords();
  }

  init() {
    // if (!this.state.hideCheckBoxColumn && !this.state.recordTypeId) {
    //   this.state.hideCheckBoxColumn = true;
    // }
  }

  handleOnSort(event) {
    window.clearTimeout(this.delayTimeout);

    this.showSpinner = true;

    this.delayTimeout = setTimeout(() => {
      const { fieldName, sortDirection } = event.detail;
      this.state.sortedBy = fieldName;
      this.state.sortDirection = sortDirection;
      this.showRecords();
    }, DELAY);
  }

  handleRowAction(event) {
    const theEvent = new CustomEvent('rowaction', { detail: event.detail });
    this.dispatchEvent(theEvent);
  }

  /**
     * query more records based uppon the limit records and the offset of records that are already being shown
     * @param  {any} event - event.target of the datatable scroll
     */
  loadMoreData(event) {
    let infiniteLoading = event.target.enableInfiniteLoading;
    let isLoading = event.target.isLoading;
    window.clearTimeout(this.delayTimeout);

    this.delayTimeout = setTimeout(async () => {
        
        this.loadMoreStatus = 'Loading';
        this.isLoading = true;
        isLoading = true;

        if (this.state.records.length >= this.totalNumberOfRecords) {
          this.loadMoreStatus = 'No more data to load';
          infiniteLoading = false;
          isLoading = false;
          this.isLoading = false;
          return;
        }

        const { limitOfRecords, objectApiName, sortedBy, sortDirection, records } = this.state;
        
        const previousOffSet = this.queryOffSet;
        const previousRecords = [...records];
        const previousStaticRecords = [...this.staticRecords];

        this.queryOffSet = this.queryOffSet + limitOfRecords;

        try {
          const result = await getRecords({ queryParameters : JSON.stringify({
            limitOfRecords,
            objectApiName: objectApiName,
            fields : this.fields,
            offSet : this.queryOffSet,
            sortedBy,
            sortDirection
          })});
      
          if (result) {
            const newData = flattenRecords(cloneArray(result.records));
            this.state.records = this.state.records.concat(newData);
            this.staticRecords = this.staticRecords.concat(newData);
            this.loadMoreStatus = '';
            this.totalNumberOfRecords = result.totalRecordCount;
          }
        } catch (error) {
          this.loadMoreStatus = '';
          showToastApexError.call(this, error);
          this.state.records = previousStaticRecords;
          this.staticRecords = previousRecords;
          this.queryOffSet = previousOffSet;
        }

        isLoading = false;
        this.isLoading = false;
    }, DELAY);
  }

  handleSave(event) {
    debugger;
    this.draftValues = event.detail.draftValues;
  }

  recordTypeIds;
  currentRecordType;
  recordTypeFetchIndex = 0;
  picklistValuesByRecordType = {};

  @wire(getObjectInfo, { objectApiName: '$state.objectApiName' })
  wiredObjectInfo({ data, error }){
    if(data) {
      this.recordTypeIds = Object.getOwnPropertyNames(data.recordTypeInfos);
      this.currentRecordType = this.recordTypeIds[this.recordTypeFetchIndex];
    } else if (error) {
      this.recordTypeIds = null;
    }
  }

  @wire(getPicklistValuesByRecordType, { objectApiName: '$state.objectApiName', recordTypeId: '$currentRecordType' })
  wiredData({ error, data }) {
    if (data) {
      this.picklistValuesByRecordType[this.currentRecordType] = data.picklistFieldValues;

      if (this.recordTypeFetchIndex < this.recordTypeIds.length) {
        this.recordTypeFetchIndex++;
        this.currentRecordType = this.recordTypeIds[this.recordTypeFetchIndex];
      }
    } else if (error) {
      console.error('Error:', error);
    }
  }

  @wire(MessageContext)
  messageContext;

  handleValueRequest(event) {
    event.stopPropagation();
  // if (action === 'valueRequest') {

    const {fieldApiName, controllerFieldApiName, rowId, recordTypeId } = event.detail;

    const valueInDrafted = this.template.querySelector('c-data-table-extended-types')
      .draftValues.find(e => e.Id == rowId)?.[fieldApiName];
    const valueInRecords = this.state.records.find(e => e.Id == rowId)?.[fieldApiName];

    let value = valueInDrafted || valueInRecords;

    // controller field is checkbox
    if (typeof valueInDrafted === 'boolean') {
      value = valueInDrafted;
    } else if (typeof valueInRecords === 'boolean') {
      value = valueInRecords;
    }

    publish(
      this.messageContext,
      dataTableMessageChannel,
      {
        action: 'valueResponse' ,
        detail: {
          rowId,
          value,
          fieldDependency: this.picklistValuesByRecordType[recordTypeId][controllerFieldApiName]
        }
      }
    );
  }


  // @track draftValues = [];
  handleChange(event) {
    debugger
    // this.draftValues = JSON.parse(JSON.stringify(event.detail.draftValues));
  }
}