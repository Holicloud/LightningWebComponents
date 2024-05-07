import { LightningElement, api, track, wire } from "lwc";
import getRecords from "@salesforce/apex/CustomDataTableController.getRecords";
// import getRecordsNonCacheable from '@salesforce/apex/CustomDataTableController.getRecordsNonCacheable';
import LightningConfirm from "lightning/confirm";
import { formatColumns } from "c/customDataTableHelper";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { clone } from "c/utils";
import {
  getObjectInfo,
  getPicklistValuesByRecordType
} from "lightning/uiObjectInfoApi";
import { publish, MessageContext } from "lightning/messageService";
import dataTableMessageChannel from "@salesforce/messageChannel/DataTable__c";

const DELAY = 300;
const RECORD_TYPE_ID_FIELD = "RecordTypeId";
export default class Datatable extends LightningElement {
  // public props

  @api defaultSortDirection = "asc";

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
    objectApiName: "DataTest__c",
    records: [],
    recordTypeId: null,
    sortDirection: "asc",
    sortedBy: "Level2__c",
    columns: [
      { fieldName: "Level1__c", editable: true },
      { fieldName: "test__c", editable: true },
      { fieldName: "Level2__c", editable: true },
      { fieldName: "Lvl2B__c", editable: true },
      { fieldName: "Level3__c", editable: true },
      { fieldName: "Level4__c", editable: true },
      // { fieldName: "RecordTypeId", editable: true },
      // { fieldName: "RecordType.Name", label: "Recordtype Name" },
      { fieldName: "Currency__c", editable: true },
      { fieldName: "Date__c", editable: true },
      { fieldName: "DateTime__c", editable: true },
      { fieldName: "Email__c", editable: true },
      { fieldName: "Lookup__c", editable: true },
      { fieldName: "Number__c", editable: true },
      { label: "Owner", fieldName: "Owner.Name", editable: true },
      { fieldName: "Percent__c", editable: true },
      { fieldName: "Phone__c", editable: true },
      { fieldName: "TextArea__c", editable: true },
      { fieldName: "Name", editable: true, sortable: true },
      { fieldName: "Time__c", editable: true },
      { fieldName: "Url__c", editable: true }
    ]
  };

  @track _draftValues = [];

  _delayTimeout;
  _loadMoreStatus;
  _queryOffSet = 0;
  _recordTypeInfos = [];
  _showSpinner = true;
  _staticRecords;
  _currentRecordType = null;
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
  }

  @api
  get columns() {
    return this._state.columns;
  }

  set columns(value) {
    if (Array.isArray(value) && !value.length) {
      this._state.columns = value;
    }
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

  get tableElement() {
    return this.template.querySelector("c-data-table-extended-types");
  }

  // public methods

  // wire methods

  @wire(getObjectInfo, { objectApiName: "$_state.objectApiName" })
  wiredObjectInfo({ data, error }) {
    if (data) {
      this._recordTypeInfos = JSON.parse(JSON.stringify(data.recordTypeInfos));
      this._currentRecordType = Object.keys(data.recordTypeInfos)[0];
    } else if (error) {
      this.showToastApexError(error);
      this._recordTypeInfos = null;
      this._currentRecordType = null;
    }
  }

  // fetches all the picklist information for all the recordtypes for the sobject
  @wire(getPicklistValuesByRecordType, {
    objectApiName: "$objectApiName",
    recordTypeId: "$_currentRecordType"
  })
  async wiredData({ error, data }) {
    if (data) {
      this._recordTypeInfos[this._currentRecordType].picklistFieldValues =
        data.picklistFieldValues;
      const nextRecordType = Object.values(this._recordTypeInfos).find(
        (e) => !e.picklistFieldValues
      )?.recordTypeId;
      if (nextRecordType) {
        this._currentRecordType = nextRecordType;
      }
    } else if (error) {
      this.showToastApexError(error);
    }
  }

  // event handlers

  async _handleSort(event) {
    if (this.tableElement.draftValues?.length) {
      const result = await LightningConfirm.open({
        message:
          "You have unsaved changes. Are you sure you want to DISCARD these changes?",
        label: "Discard Changes",
        theme: "warning"
      });

      if (!result) return;
    }

    window.clearTimeout(this._delayTimeout);

    this._draftValues = [];
    this._showSpinner = true;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this._delayTimeout = setTimeout(() => {
      const { fieldName, sortDirection } = event.detail;
      this._state.sortedBy = fieldName;
      this._state.sortDirection = sortDirection;
      this._showRecords();
    }, DELAY);
  }

  _handleRowAction(event) {
    const theEvent = new CustomEvent("rowaction", { detail: event.detail });
    this.dispatchEvent(theEvent);
  }

  /**
   * query more records based uppon the limit records and the offset of records that are already being shown
   * @param  {any} event - event.target of the datatable scroll
   */
  _handleLoadMoreData(event) {
    /* eslint-disable no-unused-vars */
    let infiniteLoading = event.target.enableInfiniteLoading;
    let isLoading = event.target.isLoading;
    /* eslint-enable no-unused-vars */
    window.clearTimeout(this._delayTimeout);

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this._delayTimeout = setTimeout(async () => {
      this._loadMoreStatus = "Loading";
      this._state.isLoading = true;
      isLoading = true;

      if (this._state.records.length >= this._totalNumberOfRecords) {
        this._loadMoreStatus = "No more data to load";
        infiniteLoading = false;
        isLoading = false;
        this._state.isLoading = false;
        return;
      }

      const {
        limitOfRecords,
        objectApiName,
        sortedBy,
        sortDirection,
        records
      } = this._state;

      const previousOffSet = this._queryOffSet;
      const previousRecords = [...records];
      const previousStaticRecords = [...this._staticRecords];

      this._queryOffSet = this._queryOffSet + limitOfRecords;

      try {
        const result = await getRecords({
          queryParameters: JSON.stringify({
            limitOfRecords,
            objectApiName,
            fields: this._fields,
            offSet: this._queryOffSet,
            sortedBy,
            sortDirection
          })
        });

        const newData = clone(result.records);
        this._state.records = this._state.records.concat(newData);
        this._staticRecords = this._staticRecords.concat(newData);
        this._loadMoreStatus = "";
        this._totalNumberOfRecords = result.totalRecordCount;
      } catch (error) {
        this._loadMoreStatus = "";
        this.showToastApexError(error);
        this._state.records = previousStaticRecords;
        this._staticRecords = previousRecords;
        this._queryOffSet = previousOffSet;
      }

      isLoading = false;
      this._state.isLoading = false;
    }, DELAY);
  }

  _handleSave(event) {
    const theEvent = new CustomEvent("save", { detail: event.detail });
    this.dispatchEvent(theEvent);
  }

  // a child edit table requested current row information
  _handleRowInfoRequest(event) {
    event.stopPropagation();

    const { rowId, fieldName, parentName } = event.detail;

    const row = this.getRow({ rowId });

    let { values, controllerValues } = {
      ...this._recordTypeInfos[row[RECORD_TYPE_ID_FIELD]].picklistFieldValues[
        fieldName
      ]
    };

    if (!values) return;

    if (parentName) {
      const parentValue = row[parentName];
      values = values.filter(({ validFor }) =>
        validFor.includes(controllerValues[parentValue])
      );
    }

    // publish message so the child gets the row data aswell as que recordtype information for the current recordtype

    publish(this.messageContext, dataTableMessageChannel, {
      action: "rowinforesponse",
      detail: { rowId, values }
    });
  }

  _handleChange(event) {
    event.stopPropagation();
    this.updatePicklistDependenciesWhenControllingFieldChanged(
      event.detail.draftValues
    );
  }
  // private methods

  async _formatColumns() {
    const { columns, objectApiName } = this._state;
    if (columns && objectApiName && !this.formatColumnsHasRun) {
      const { data, error } = await formatColumns({ objectApiName, columns });
      if (data) {
        this._state.columns = data;
      } else {
        this.showToastApexError(error);
      }
      this.formatColumnsHasRun = true;
    } else {
      this.formatColumnsHasRun = false;
    }
  }

  async _showRecords() {
    // this.resetDraftedValues();
    const { limitOfRecords, objectApiName, sortedBy, sortDirection } =
      this._state;
    this._showSpinner = true;
    try {
      const result = await getRecords({
        queryParameters: JSON.stringify({
          limitOfRecords,
          objectApiName: objectApiName,
          fields: this._fields,
          whereClause: `Level2__c != null`,
          sortedBy,
          sortDirection
        })
      });

      this._totalNumberOfRecords = result.totalRecordCount;
      const records = clone(result.records);
      this._staticRecords = [...records];
      this._state.records = records;
    } catch (error) {
      this.showToastApexError(error);
      this._state.records = null;
      this._staticRecords = null;
    }

    this._showSpinner = false;
  }

  getRow({ rowId }) {
    return {
      ...this._state.records.find((e) => e.Id === rowId),
      ...this.tableElement.draftValues.find((e) => e.Id === rowId)
    };
  }

  showToastApexError({ title, message, variant }) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }

  // hooks

  async connectedCallback() {
    await this._formatColumns();
    await this._showRecords();
  }

  handlePicklistValuesByRecordTypeFetched(event) {
    this._recordTypeInfos = event.detail;
  }

  // dependency fields

  updatePicklistDependenciesWhenControllingFieldChanged(changedRecords) {
    const allDrafted = [...this.tableElement.draftValues];

    for (const changedRecord of changedRecords) {
      const [field] = Object.getOwnPropertyNames(changedRecord);
      const { type, typeAttributes } = this._state.columns.find(
        ({ fieldName }) => fieldName === field
      );

      if (["picklist", "boolean", "multipicklist"].includes(type)) {
        const rowId = changedRecord.Id;
        const row = this.getRow({ rowId });
        this._updateDependencies({
          allDrafted,
          field,
          recordTypeInfo: this._recordTypeInfos[row[RECORD_TYPE_ID_FIELD]],
          rowId,
          row,
          parentValue: typeAttributes?.isChild
            ? row[typeAttributes.parentName]
            : null
        });
      }
    }

    // updates the data table
    this._draftValues = [...allDrafted];
  }

  _updateDependencies({
    allDrafted,
    clearChild = false,
    field,
    parentValue,
    recordTypeInfo,
    rowId,
    row
  }) {
    const {
      type,
      typeAttributes: { isChild, isParent, childs }
    } = this._state.columns.find((e) => e.fieldName === field);

    const value = row[field];

    if (["picklist", "multipicklist"].includes(type)) {
      if (clearChild) {
        this.pushToDraft({ field, rowId, allDrafted });
      } else if (value !== undefined) {
        // there is a value in the field or the value on the field changed
        let { values, controllerValues } =
          recordTypeInfo.picklistFieldValues[field];

        if (isChild) {
          values = values.filter(({ validFor }) =>
            validFor.includes(controllerValues[parentValue])
          );
        }

        const validOptions = values.map((opt) => opt.value);

        const valid = value
          .split(";")
          .every((selected) => validOptions.includes(selected));

        if (!valid) {
          // current selected option is not valid because of the recordtype and field dependency so
          // clear this field and all dependent fields as well
          clearChild = true;
          this.pushToDraft({ field, rowId, allDrafted });
        }
      }
    }

    if (isParent && (value !== undefined || clearChild)) {
      for (const childField of childs) {
        this._updateDependencies({
          allDrafted,
          rowId,
          field: childField,
          parentValue: value,
          recordTypeInfo,
          row,
          clearChild
        });
      }
    }
  }

  pushToDraft({ field, rowId, allDrafted }) {
    const existingDraft = allDrafted.find(({ Id }) => Id === rowId);
    if (!existingDraft) {
      allDrafted.push({ [field]: "", Id: rowId });
    } else {
      existingDraft[field] = "";
    }
  }
}
