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
const RECORD_TYPE_ID_FIELD = 'RecordTypeId';
export default class Datatable extends LightningElement {
  // public props

  @api defaultSortDirection = 'asc';
  

  // wire prop

  @wire(MessageContext)
  messageContext;
  
  // private props

  @track _state = {
    isLoading: false,
    enableInfiniteLoading: false,
    hideCheckBoxColumn: false,
    limitOfRecords: 50,
    loadMoreOffset: 20,
    maxColumnWidth: 1000,
    minColumnWidth: 50,
    objectApiName : 'DataTest__c',
    records : [],
    recordTypeId: null,
    sortDirection: 'asc',
    sortedBy: 'Currency__c',
    columns : [
      { fieldName: 'Level1__c', editable: true },
      { fieldName: 'Level2__c', editable: true },
      { fieldName: 'Lvl2B__c', editable: true },
      { fieldName: 'Level3__c', editable: true },
      // { fieldName: 'Level4__c', editable: true },
      // { fieldName: 'RecordTypeId', editable: true },
      // { fieldName: 'RecordType.Name', label: 'Recordtype Name' },
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

  @track _draftValues = [];

  _currentRecordType = null;
  _delayTimeout;
  _loadMoreStatus;
  _queryOffSet = 0;
  _recordTypeInfos = [];
  _showSpinner = true;
  _staticRecords;
  _totalNumberOfRecords;

  // public getters-setters

  @api
  get sortedBy() {
    return this._state.sortedBy;
  }

  set sortedBy(value) {
    this._state.sortedBy = value;
  }

  @api
  get sortDirection() {
    return this._state.sortDirection;
  }

  set sortDirection(value) {
    this._state.sortDirection = value;
  }

  @api
  get enableInfiniteLoading() {
    return this._state.enableInfiniteLoading;
  }

  set enableInfiniteLoading(value) {
    this._state.enableInfiniteLoading = value;
  }

  @api
  get loadMoreOffset() {
    return this._state.loadMoreOffset;
  }

  set loadMoreOffset(value) {
    this._state.loadMoreOffset = value;
  }

  @api
  get minColumnWidth() {
    return this._state.minColumnWidth;
  }

  set minColumnWidth(value) {
    this._state.minColumnWidth = value;
  }

  @api
  get maxColumnWidth() {
    return this._state.maxColumnWidth;
  }

  set maxColumnWidth(value) {
    this._state.maxColumnWidth = value;
  }

  @api
  get hideCheckBoxColumn() {
    return this._state.hideCheckBoxColumn;
  }

  set hideCheckBoxColumn(value) {
    this._state.hideCheckBoxColumn = value;
  }

  @api
  get objectApiName() {
    return this._state.objectApiName;
  }

  set objectApiName(value) {
    this._wiredObjectApiName.objectApiName = value;
    this._state.objectApiName = value;
    // this._formatColumns();
  }

  @api
  get columns() {
    return this._state.columns;
  }

  set columns(value) {
    if (!value || !Array.isArray(value) || !value.length) {
      showToastError.call(this, `invalid value for columns ${JSON.stringify(value)}`);
      return;
    }

    this._state.columns = value;
    // this._formatColumns();
  }

  @api
  get limitOfRecords() {
    return this._state.limitOfRecords;
  }

  set limitOfRecords(value) {
    this._state.limitOfRecords = value;
  }

  @api
  get isLoading() {
    return this._state.isLoading;
  }

  set isLoading(value) {
    this._state.isLoading = value;
  }

  // private getters-setters

  get _fields() {
    let result = new Set();

    for (const { apexFieldsReferenced } of this._state.columns) {
      for (const field of apexFieldsReferenced) {
        result.add(field);
      }
    }

    return [...result];
  }

  // public methods
  // wire methods

  @wire(getObjectInfo, { objectApiName: '$_state.objectApiName' })
  wiredObjectInfo({ data, error }){
    if(data) {
      this._recordTypeInfos = JSON.parse(JSON.stringify(data.recordTypeInfos));
      this._currentRecordType = Object.keys(data.recordTypeInfos)[0];
    } else if (error) {
      this._recordTypeInfos = null;
      this._currentRecordType = null;
    }
  }

  @wire(getPicklistValuesByRecordType, { objectApiName: '$_state.objectApiName', recordTypeId: '$_currentRecordType' })
  async wiredData({ error, data }) {
    if (data) {
      this._recordTypeInfos[this._currentRecordType].picklistFieldValues = data.picklistFieldValues;
      const nextRecordType = Object.values(this._recordTypeInfos)
        .find(e => !e.picklistFieldValues)?.recordTypeId;
      if (nextRecordType) {
        this._currentRecordType = nextRecordType;
      }
    } else if (error) {
      console.error('Error:', error);
    }
  }

  // event handlers

  _handleSort(event) {
    window.clearTimeout(this._delayTimeout);

    this._showSpinner = true;

    this._delayTimeout = setTimeout(() => {
      const { fieldName, sortDirection } = event.detail;
      this._state.sortedBy = fieldName;
      this._state.sortDirection = sortDirection;
      this._showRecords();
    }, DELAY);
  }

  _handleRowAction(event) {
    const theEvent = new CustomEvent('rowaction', { detail: event.detail });
    this.dispatchEvent(theEvent);
  }

  /**
     * query more records based uppon the limit records and the offset of records that are already being shown
     * @param  {any} event - event.target of the datatable scroll
     */
  _handleLoadMoreData(event) {
    let infiniteLoading = event.target.enableInfiniteLoading;
    let isLoading = event.target.isLoading;
    window.clearTimeout(this._delayTimeout);

    this._delayTimeout = setTimeout(async () => {
        
        this._loadMoreStatus = 'Loading';
        this._state.isLoading = true;
        isLoading = true;

        if (this._state.records.length >= this._totalNumberOfRecords) {
          this._loadMoreStatus = 'No more data to load';
          infiniteLoading = false;
          isLoading = false;
          this._state.isLoading = false;
          return;
        }

        const { limitOfRecords, objectApiName, sortedBy, sortDirection, records } = this._state;
        
        const previousOffSet = this._queryOffSet;
        const previousRecords = [...records];
        const previous_StaticRecords = [...this._staticRecords];

        this._queryOffSet = this._queryOffSet + limitOfRecords;

        try {
          const result = await getRecords({ queryParameters : JSON.stringify({
            limitOfRecords,
            objectApiName: objectApiName,
            fields : this._fields,
            offSet : this._queryOffSet,
            sortedBy,
            sortDirection
          })});
      
          if (result) {
            const newData = flattenRecords(cloneArray(result.records));
            this._state.records = this._state.records.concat(newData);
            this._staticRecords = this._staticRecords.concat(newData);
            this._loadMoreStatus = '';
            this._totalNumberOfRecords = result.totalRecordCount;
          }
        } catch (error) {
          this._loadMoreStatus = '';
          showToastApexError.call(this, error);
          this._state.records = previous_StaticRecords;
          this._staticRecords = previousRecords;
          this._queryOffSet = previousOffSet;
        }

        isLoading = false;
        this._state.isLoading = false;
    }, DELAY);
  }

  _handleSave(event) {
    // debugger;
    // this.draftValues = [{Level1__c: false, Id: 'a018b00000yi4VeAAI'}];
    // this.draftValues = event.detail.draftValues;
  }

  _handleRowInfoRequest(event) {
    event.stopPropagation();

    const { rowId, fieldName, parentName } = event.detail;

    const rowInfo = this._getRow({ rowId });

    let { values, controllerValues } = {...this._recordTypeInfos[
        this._getFieldValue({ field : RECORD_TYPE_ID_FIELD, rowInfo })
    ].picklistFieldValues[fieldName]};
    
    if (!values) return;

    if (parentName) {
      const parentValue = this._getFieldValue({ field : parentName, rowInfo });
      values = values.filter(opt => opt.validFor.includes(controllerValues[parentValue]));
    }

    publish(
      this.messageContext,
      dataTableMessageChannel,
      { action: 'rowinforesponse' , detail: { rowId, values } }
    );
  }

  _handleChange(event) {
    event.stopPropagation();

    const allDrafted = this.template.querySelector('c-data-table-extended-types')
      .draftValues;

    for (const cellChangeDraft of event.detail.draftValues) {

      const [ field ] = Object.getOwnPropertyNames(cellChangeDraft);
      
      const {type, typeAttributes} = this._state.columns.find(e => e.fieldName === field);

      const rowId = cellChangeDraft.Id;
      const rowInfo = this._getRow({ rowId });
      const recordTypeInfo = this._recordTypeInfos[this._getFieldValue({ field : RECORD_TYPE_ID_FIELD, rowInfo })];
      
      if (['picklist', 'boolean', 'multi-picklist'].includes(type)) {
        this._updateDependencies({
          allDrafted,
          field,
          recordTypeInfo,
          rowId,
          rowInfo,
          parentValue: typeAttributes?.isChild && this._getFieldValue({field : typeAttributes.parentName, rowInfo })
        });
      } else if (field === RECORD_TYPE_ID_FIELD) {

      }
    }

    this._draftValues = [...allDrafted];
  }

  // private methods

  async _formatColumns() {
    const { columns, objectApiName } = this._state;
    if (columns && objectApiName && !this.formatColumnsHasRun)  {
      const { data, error } = await formatColumns({ objectApiName, columns })
      if (data) {
        this._state.columns = data; 
      } else {
        showToastApexError.call(this, error);
      }
      this.formatColumnsHasRun = true;
    } else {
      this.formatColumnsHasRun = false;
    }
  }

  async _showRecords() {
    // this.resetDraftedValues();
    const { limitOfRecords, objectApiName, sortedBy, sortDirection } = this._state;
    this._showSpinner = true;
    try {
      const result = await getRecords({ queryParameters : JSON.stringify({
          limitOfRecords,
          objectApiName: objectApiName,
          fields : this._fields,
          // whereClause: `Id IN ('a018b00000yi4X6AAI',  'a018b00000yi4VeAAI') `,
          sortedBy,
          sortDirection
      })});
  
      if (result) {
        this._totalNumberOfRecords = result.totalRecordCount;
        const records = flattenRecords(cloneArray(result.records));
        this._staticRecords = [...records]; 
        this._state.records = records;
      }
      
    } catch (error) {
      showToastApexError.call(this, error);
      this._state.records = null;
      this._staticRecords = null; 
    }

    this._showSpinner = false
  }

  _getRow({ rowId }) {
    const drafted = this.template.querySelector('c-data-table-extended-types')
      .draftValues
      .find(e => e.Id == rowId);

    const record = this._state.records.find(e => e.Id == rowId);

    return { drafted , record };
  }

  _updateDependencies({
    allDrafted,
    clearChild = false,
    field,
    parentValue,
    recordTypeInfo,
    rowId,
    rowInfo,
  }) {
    const { type, typeAttributes: { isChild, isParent, childs } } =
      this._state.columns.find(e => e.fieldName === field);
    
    const value = this._getFieldValue({ field : field, rowInfo });

    if (type === 'picklist') {

      const existingDraft = allDrafted.find(d => d.Id === rowId);

      if (clearChild) {
        this._pushToDraft({ allDrafted, existingDraft, field, rowId });
      } else if (value !== undefined) {

        let { values, controllerValues } = recordTypeInfo.picklistFieldValues[field];

        if (isChild) {
          values = values.filter(opt => opt.validFor.includes(controllerValues[parentValue]));
        }

        if (!values.find(opt => opt.value === value)) {
          clearChild = true;
          this._pushToDraft({ allDrafted, existingDraft, field, rowId });
        }
      }
    }

    if (isParent && (value !== undefined || clearChild)) {
      for (const field of childs) {
        this._updateDependencies({
          rowId,
          allDrafted,
          field,
          parentValue: value,
          recordTypeInfo,
          rowInfo,
          clearChild
        });
      }
    }
  }

  _pushToDraft({ allDrafted, existingDraft, field, rowId }) {
    if (!existingDraft) {
      allDrafted.push({ [field] : '', Id : rowId })
    } else {
      existingDraft[field] = '';
    }
  }

  _getFieldValue({ field, rowInfo }) {

    const valueInDrafted = rowInfo.drafted?.[field];
    if (typeof valueInDrafted === 'boolean' || valueInDrafted) {
      return valueInDrafted;
    }

    return rowInfo.record?.[field];
  }

  // hooks

  async connectedCallback() {
    await this._formatColumns();
    await this._showRecords();
  }
}