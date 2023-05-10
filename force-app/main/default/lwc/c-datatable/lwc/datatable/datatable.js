/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/CustomDataTableController.getRecords';
import getRecordsNonCacheable from '@salesforce/apex/CustomDataTableController.getRecordsNonCacheable';
import { formatColumns } from 'c/customDataTableHelper';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { flattenRecords, cloneArray, showToastError, showToastApexError } from 'c/commonFunctionsHelper';
const DELAY = 800;
export default class Datatable extends LightningElement {
  @track state = {
    object : 'DataTest__c',
    records : [],
    limitOfRecords: 50,
    sortedBy: 'Currency__c',
    sortDirection: 'asc',
    hideCheckBoxColumn: false,
    enableInfiniteLoading: false,
    loadMoreOffset: 20,
    minColumnWidth: 50,
    maxColumnWidth: 1000,
    columns : [
      { fieldName: 'Checkbox__c', editable: true },
      { fieldName: 'Currency__c', editable: true },
      { fieldName: 'Date__c', editable: true },
      { fieldName: 'DateTime__c', editable: true },
      { fieldName: 'Email__c', editable: true },
      { fieldName: 'Lookup__c', editable: true },
      { fieldName: 'MultiSelectPicklist__c', editable: true },
      { fieldName: 'Number__c', editable: true },
      { label: 'Owner', fieldName: 'Owner.Name', editable: true },
      { fieldName: 'Percent__c', editable: true },
      { fieldName: 'Phone__c' , editable: true },
      { fieldName: 'Picklist__c', editable: true },
      { fieldName: 'TextArea__c', editable: true },
      { fieldName: 'Text__c', editable: true },
      { fieldName: 'Time__c', editable: true },
      { fieldName: 'Url__c', editable: true },
    ]
  };

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
  get object() {
    return this.state.object;
  }

  set object(value) {
    this.state.object = value;
    this.formatColumns();
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
    this.formatColumns();
  }

  @api
  get limitOfRecords() {
    return this.state.limitOfRecords;
  }

  set limitOfRecords(value) {
    this.state.limitOfRecords = value;
  }

  async formatColumns() {
    const {columns, object} = this.state;
    if (columns && object && !this.formatColumnsHasRun)  {
      this.state.columns = await formatColumns({ object, columns });
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
    const { limitOfRecords, object, sortedBy, sortDirection } = this.state;
    this.showSpinner = true;
    try {
      const result = await getRecords({ queryParameters : JSON.stringify({
          limitOfRecords,
          objectApiName: object,
          fields : this.fields,
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
    await this.formatColumns();
    await this.showRecords();
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
        isLoading = true;

        if (this.state.records.length >= this.totalNumberOfRecords) {
          this.loadMoreStatus = 'No more data to load';
          infiniteLoading = false;
          isLoading = false;
          return;
        }

        const { limitOfRecords, object, sortedBy, sortDirection, records } = this.state;
        
        const previousOffSet = this.queryOffSet;
        const previousRecords = [...records];
        const previousStaticRecords = [...this.staticRecords];

        this.queryOffSet = this.queryOffSet + limitOfRecords;

        try {
          const result = await getRecords({ queryParameters : JSON.stringify({
            limitOfRecords,
            objectApiName: object,
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
    }, DELAY);
  }
}