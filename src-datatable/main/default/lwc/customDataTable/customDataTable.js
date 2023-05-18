/* eslint-disable no-console */
import { LightningElement, api, track, wire } from "lwc";
// import getRecordsWithCounter from '@salesforce/apex/CustomDataTableController.getRecordsWithCounter';
// import getRecordsWithCounterNonCacheable from '@salesforce/apex/CustomDataTableController.getRecordsWithCounterNonCacheable';
import {
  buildQuery,
  getApexFields,
  formatColumns,
  buildQueryCounter,
  sortBy
} from "c/customDataTableHelper";
import {
  flattenRecords,
  copyRecordsIntoNewArray,
  showApexErrorMessage,
  isBlank,
  getRecordTypeIdFromDevName
} from "c/commonFunctionsHelper";
import {
  getObjectInfo,
  getPicklistValuesByRecordType
} from "lightning/uiObjectInfoApi";
const DELAY = 800;
export default class CustomDataTable extends LightningElement {
  /**
   * @description limit the amount of records displayed by the lookup
   * @type {string}
   * @default '20'
   * @example "20"
   */
  @track _limitOfRecords = "20";
  @api
  get limitOfRecords() {
    return this._limitOfRecords;
  }
  set limitOfRecords(value) {
    if (value) {
      value = value.trim();
      if (parseInt(value, 10) > 99) {
        value = "99";
      }
      this.setAttribute("limitOfRecords", value);
      this._limitOfRecords = value;
    }
  }
  /**
   * @description limit the amount of records displayed by the lookup
   * @type {string}
   * @default '20'
   * @example "20"
   */
  @api tableId;
  /**
   * @type {string}
   * @example 'CustomObject__c'
   * @default 'Account'
   */
  // @api objectApiName = 'Account';
  @api objectApiName = "Account";
  /**
   * @description same as https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation but supports object relationships
   * @type {Array<any>}
   * @default [ { label: 'Nombre', fieldName: 'Name', }, { fieldName: 'LastName' }, { fieldName: 'FirstName' }, { label: 'Recordtype', fieldName: 'RecordType.Name' } ]
   * @example
   */
  // @api columns = [{ label: 'Nombre', fieldName: 'Name', }, { fieldName: 'LastName' }, { fieldName: 'FirstName' }, { label: 'Recordtype', fieldName: 'RecordType.Name' }];
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
  set searchByApiName(value) {
    this._searchByApiName = !value ? "Name" : value.trim().toUpperCase();
    this.setAttribute("searchByApiName", this._searchByApiName);
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
    whereClause = !whereClause ? "" : whereClause.trim();
    this.setAttribute("whereClause", whereClause);
    this._whereClause = whereClause;
  }
  @api
  get searchKey() {
    return this._searchKey;
  }
  set searchKey(searchKey) {
    searchKey = searchKey === undefined ? "" : searchKey;
    this._searchKey = searchKey;
    this.setAttribute("searchKey", searchKey);
  }
  @api
  get showSpinner() {
    return this._showSpinner;
  }
  set showSpinner(value) {
    this.setAttribute("showSpinner", value);
    this._showSpinner = value;
  }
  @track _height;
  @track _width;
  @api
  get height() {
    return this._height;
  }
  set height(value) {
    this.setAttribute("height", value);
    this._height = value;
  }
  @api
  get width() {
    return this._width;
  }
  set width(value) {
    this.setAttribute("width", value);
    this._width = value;
  }
  @api
  get hideInput() {
    return this._hideInput;
  }
  set hideInput(value) {
    this.setAttribute("hideInput", value);
    this._hideInput = value;
  }
  _columns = [];
  @api
  get columns() {
    return this._columns;
  }
  set columns(theColumns) {
    this.setAttribute("columns", theColumns);
    this._columns = theColumns;
  }
  /**
   * @type {boolean}
   * @default false
   */
  @track _hideCheckBoxColumn = true;
  @api
  get showCheckboxColumn() {
    return !this._hideCheckBoxColumn;
  }
  set showCheckboxColumn(value) {
    this.setAttribute("showCheckboxColumn", value);
    this._hideCheckBoxColumn = !value;
  }
  @api mainRecordType;
  /** builds title string */
  get title() {
    if (this.objectLabel && this.records && this.totalNumberOfRecords) {
      return `${this.objectLabel} records (${this.records.length} of ${this.totalNumberOfRecords})`;
    }
    return undefined;
  }

  @track objectInfo;
  @wire(getObjectInfo, { objectApiName: "$objectApiName" })
  handleGetInfo({ data, error }) {
    if (data) {
      this.objectInfo = data;
      this.objectLabel = data.label;
      if (isBlank(this.recordtypeDeveloperName)) {
        this.recordTypeId = "012000000000000AAA";
      } else {
        let run = async () => {
          this.recordTypeId = await getRecordTypeIdFromDevName(
            this.recordtypeDeveloperName,
            this.objectApiName
          );
        };
        run();
      }
    } else if (error) {
      this.objectInfo = undefined;
    }
  }
  _recordtypeDeveloperName;
  @track recordTypeId;
  @api recordtypeDeveloperName;
  @wire(getPicklistValuesByRecordType, {
    objectApiName: "$objectApiName",
    recordTypeId: "$recordTypeId"
  })
  wiredPicklistValuesByRecordType({ data, error }) {
    if (data) {
      let run = async () => {
        if (this.objectApiName && this.columns) {
          let editableColumns = copyRecordsIntoNewArray(this.columns);
          this.columns = await formatColumns(
            editableColumns,
            this.objectApiName
          );
          const picklistValuesMap = new Map();
          Object.entries(data.picklistFieldValues).forEach(([key, value]) => {
            picklistValuesMap.set(key.toUpperCase(), value);
          });
          this.columns.forEach((column) => {
            let fieldName = column.fieldName.toUpperCase();
            if (
              column.type === "picklist" &&
              column.editable !== undefined &&
              column.editable &&
              column.typeAttributes.options === undefined &&
              [...picklistValuesMap.keys()].includes(fieldName)
            ) {
              let picklistOptions = [];
              picklistValuesMap
                .get(fieldName)
                .values.forEach((picklistValue) => {
                  picklistOptions.push({
                    value: picklistValue.value,
                    label: picklistValue.label
                  });
                });
              column.typeAttributes.options = picklistOptions;
            }
          });
        }
        this.queryApexFields = getApexFields(this.columns);
        this.show();
      };
      run();
    } else if (error) {
    }
  }

  /**
   * @type {string}
   * @example 'custom:device'
   * @default 'standard:account'
   */
  @api iconName;
  /** @type {string} */
  @track objectLabel;
  /** @type {boolean} @default false*/
  /**
   * @description lookup will display anyrecord that searchkey matches with given fields (searchByApiNameField like  '%searchkey%' OR aditionalField1 like '%searchkey% OR aditionalField2 like '%searchkey%')
   * @type {string}
   * @default ''
   * @example 'Product.Name,YourCustomObject__c.Name' ApiNames of aditional fields to search
   */
  @api additionalSearchByFields = "";
  /** @type {object} errors*/
  @track _errors;
  @api
  get errors() {
    return this._errors;
  }
  set errors(errors) {
    this._errors = errors;
    this.setAttribute("errors", errors);
  }
  @track _enableInfiniteLoading = false;
  @api
  get enableInfiniteLoading() {
    return this._enableInfiniteLoading;
  }
  set enableInfiniteLoading(value) {
    this.setAttribute("enableInfiniteLoading", value);
    this._enableInfiniteLoading = value;
  }
  @api show() {
    this.resetDraftedValues();
    this._showSpinner = true;
    let run = async () => {
      const theQuery = await buildQuery(
        this._limitOfRecords,
        this.objectApiName,
        "",
        "",
        this.queryApexFields,
        this.searchByApiName,
        this.searchKey,
        this.whereClause,
        false,
        this.additionalSearchByFields
      );
      const queryCounter = buildQueryCounter(
        this.objectApiName,
        this.searchByApiName,
        this.searchKey,
        this.whereClause,
        this.additionalSearchByFields
      );
      getRecordsWithCounter({
        theQuery: theQuery,
        buildQueryCounter: queryCounter
      })
        .then((result) => {
          this.totalNumberOfRecords = result.totalRecordCount;
          const newData = [
            ...flattenRecords(copyRecordsIntoNewArray(result.records))
          ]; // return an array with the data flattened
          this.staticData = [...newData];
          this.records = newData;
          this._showSpinner = false;
        })
        .catch((error) => {
          if (error.body.message) {
            this.dispatchEvent(showApexErrorMessage(error));
          }
          this.records = undefined;
        });
      const searchItems = this.template.querySelector(".searchHelpItems");
      searchItems.classList.remove("disabled-class");
    };
    run();
  }

  @api showUpdatedData() {
    this.resetDraftedValues();
    this._errors = [];
    this._showSpinner = true;
    let run = async () => {
      const theQuery = await buildQuery(
        this._limitOfRecords,
        this.objectApiName,
        "",
        "",
        this.queryApexFields,
        this.searchByApiName,
        this.searchKey,
        this.whereClause,
        false,
        this.additionalSearchByFields
      );
      const queryCounter = buildQueryCounter(
        this.objectApiName,
        this.searchByApiName,
        this.searchKey,
        this.whereClause,
        this.additionalSearchByFields
      );
      getRecordsWithCounterNonCacheable({
        theQuery: theQuery,
        buildQueryCounter: queryCounter
      })
        .then((result) => {
          this.totalNumberOfRecords = result.totalRecordCount;
          const newData = [
            ...flattenRecords(copyRecordsIntoNewArray(result.records))
          ]; // return an array with the data flattened
          this.staticData = [...newData];
          this.records = newData;
          this._showSpinner = false;
        })
        .catch((error) => {
          if (error.body.message) {
            this.dispatchEvent(showApexErrorMessage(error));
          }
          this.records = undefined;
        });
    };
    run();
  }

  get staticD() {
    if (this.staticData !== undefined && this.staticData.length > 0) {
      return JSON.stringify(this.staticData[0]);
    }
  }

  /** @type {Boolean} */
  @track _showSpinner;
  /** @type {Boolean} */
  @track _hideInput;
  /** @type {String} */
  @track _searchKey = "";
  /** @type {Array} @default [] */
  @track _records = [];
  get records() {
    return this._records;
  }
  set records(records) {
    this._records = records && records.length > 0 ? [...records] : [];
  }
  /** @type {String} */
  @track error;
  /** @type {string} @default 'asc'*/
  @track defaultSortDirection = "asc";
  /** @type {string} @default 'asc'*/
  @track sortDirection = "asc";
  /** @type {string}*/
  @track sortedBy;
  /** @type {string}*/
  @track loadMoreStatus;
  /** @type {number} @default 0*/
  totalNumberOfRecords = 0;
  /** @type {number}*/
  queryOffSet = 0;
  /** @type {string} */
  get placeHolder() {
    return this.objectLabel ? `search in ${this.objectLabel} records` : "";
  }
  set placeHolder(value) {
    this.setAttribute("placeHolder", value);
  }

  get recordsAreOk() {
    return this.records && this.records.length > 0 ? true : false;
  }

  hasRender;
  renderedCallback() {
    this.hasRender = !this.hasRender ? true : false;
    if (this.recordsAreOk) {
      const tableContainer = this.template.querySelector(".tableContainer");
      tableContainer.style.setProperty("height", this._height);
      tableContainer.style.setProperty("width", this._width);
    }
  }
  /** @param  {any} event - event.target.value has to be the searchkey input*/
  handleOnchange(event) {
    event.preventDefault();
    window.clearTimeout(this.delayTimeout);
    this.queryOffSet = 0;
    this._searchKey = event.target.value.trim();
    this._showSpinner = true;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.delayTimeout = setTimeout(() => {
      let run = async () => {
        const theQuery = await buildQuery(
          this._limitOfRecords,
          this.objectApiName,
          "",
          "",
          this.queryApexFields,
          this.searchByApiName,
          this.searchKey,
          this.whereClause,
          false,
          this.additionalSearchByFields
        );
        const queryCounter = buildQueryCounter(
          this.objectApiName,
          this.searchByApiName,
          this.searchKey,
          this.whereClause,
          this.additionalSearchByFields
        );
        getRecordsWithCounter({
          theQuery: theQuery,
          buildQueryCounter: queryCounter
        })
          .then((result) => {
            this.totalNumberOfRecords = result.totalRecordCount;
            const newData = [
              ...flattenRecords(copyRecordsIntoNewArray(result.records))
            ]; // return an array with the data flattened
            this.staticData = [...newData];
            this.records = newData;
            this._showSpinner = false;
          })
          .catch((error) => {
            if (error.body.message) {
              showApexErrorMessage(error);
            }
            this.records = undefined;
            this.staticData = undefined;
          });
      };
      run();
    }, DELAY);
  }
  /**
   * query more records based uppon the limit records and the offset of records that are already being shown
   * @param  {any} event - event.target of the datatable scroll
   */
  loadMoreData(event) {
    let infiniteLoading = event.target.enableInfiniteLoading;
    let isLoading = event.target.isLoading;
    window.clearTimeout(this.delayTimeout);
    this.delayTimeout = setTimeout(() => {
      isLoading = true;
      this.queryOffSet = this.queryOffSet + parseInt(this._limitOfRecords);
      if (this.records.length < this.totalNumberOfRecords) {
        //si hay records aun en la base de datos
        //Display "Loading" when more data is being loaded
        this.loadMoreStatus = "Loading";
        let run = async () => {
          const theQuery = await buildQuery(
            this._limitOfRecords,
            this.objectApiName,
            this.queryOffSet.toString(),
            "",
            this.queryApexFields,
            this.searchByApiName,
            this.searchKey,
            this.whereClause,
            false,
            this.additionalSearchByFields
          );
          const queryCounter = buildQueryCounter(
            this.objectApiName,
            this.searchByApiName,
            this.searchKey,
            this.whereClause,
            this.additionalSearchByFields
          );
          getRecordsWithCounter({
            theQuery: theQuery,
            buildQueryCounter: queryCounter
          })
            .then((result) => {
              infiniteLoading = false;
              const currentData = [
                ...flattenRecords(copyRecordsIntoNewArray(result.records))
              ];
              this.staticData = [...this.staticData.concat([...currentData])];
              this.records = [...this.records.concat(currentData)];
              this.loadMoreStatus = "";
            })
            .catch((error) => {
              if (error.body.message) {
                showApexErrorMessage(error);
              }
              this.records = undefined;
              this.staticData = undefined;
            });
          isLoading = false;
        };
        run();
      } else {
        this.loadMoreStatus = "No more data to load";
        isLoading = false;
      }
    }, DELAY);
  }
  staticData; // you must not change anything about this variable
  /** handles sort event datatable*/
  onHandleSort(event) {
    const { fieldName: sortedBy, sortDirection } = event.detail;
    const cloneData = [...this.records];
    cloneData.sort(sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
    this.records = cloneData;
    this.sortDirection = sortDirection;
    this.sortedBy = sortedBy;
  }
  handleCellChange(event) {
    this.cellChanged = true;
    this._hideInput = true;
    const dataTable = this.template.querySelector('[data-id="theDataTable"]');

    // dataTable.suppressBottomBar = false;
    const theEvent = new CustomEvent("cellchange", {
      detail: event
    });
    this.dispatchEvent(theEvent);
  }
  handleSave() {
    this._hideInput = false;
    var toReturn = this.draftValues.map((draftRecord) => {
      let inner = { ...draftRecord };
      inner.rowIdInTable =
        this.records.findIndex((record) => draftRecord.Id === record.Id) + 1;
      return inner;
    });
    const theEvent = new CustomEvent("save", {
      detail: {
        draftedValues: toReturn,
        tableId: this.tableId
      }
    });
    this.dispatchEvent(theEvent);
  }
  @track cellChanged;
  get cellDataChanged() {
    return this._draftValues.length > 0 || this.cellChanged ? true : false;
  }
  @track _draftValues = [];
  @api resetDraftedValues() {
    this.draftValues = [];
    this.cellChanged = false;
  }

  @api
  get draftValues() {
    const dataTable = this.template.querySelector('[data-id="theDataTable"]');
    this._draftValues = dataTable ? dataTable.draftValues : this._draftValues;
    return this._draftValues;
  }
  set draftValues(value) {
    const dataTable = this.template.querySelector('[data-id="theDataTable"]');
    dataTable.draftValues = dataTable ? [...value] : dataTable.draftValues;
    this._draftValues = [...value];
    this.setAttribute("draftValues", value);
  }
  @api get selectedRows() {
    const dataTable = this.template.querySelector('[data-id="theDataTable"]');
    return dataTable ? dataTable.getSelectedRows() : dataTable;
  }
  get options() {
    return [
      { label: "25", value: "25" },
      { label: "50", value: "50" },
      { label: "100", value: "100" },
      { label: "250", value: "250" },
      { label: "500", value: "500" },
      { label: "1000", value: "1000" }
    ];
  }
  get optionsAreOK() {
    return (
      this.options &&
      this.options.length > 0 &&
      !isBlank(this._limitOfRecords) &&
      this.displayModal
    );
  }
  @track displayModal;
  @track displayButton = true;
  displayLimitOfRecords(event) {
    event.preventDefault();
    this.displayModal = true;
  }
  hideLimitOfRecords() {
    this.displayModal = false;
  }
  handleChangeLimitDisplayed(event) {
    this._limitOfRecords = event.detail.value;
    this.show();
    this.displayModal = false;
  }
  handleCancel(event) {
    this.draftValues = [];
    this.cellChanged = false;
    this.records = this.staticData.map((record) => {
      return { ...record };
    });
    this._hideInput = false;
    const theEvent = new CustomEvent("cancel", { detail: event });
    this.dispatchEvent(theEvent);
  }
  /**
   * handles row action and since the only action there is is the button name therefore throw the select customEvent
   * @param  {any} event row action event
   */
  handleRowAction(event) {
    const theEvent = new CustomEvent("rowaction", { detail: event.detail });
    this.dispatchEvent(theEvent);
  }
  //do not commit
  handleRowSelection(event) {
    //do something
  }
  handleCustomFieldEdit(event) {
    event.stopPropagation();
    const fieldName = event.detail.fieldName;
    const recordId = event.detail.recordId;
    const fieldValue = event.detail.value;
    const preValue = event.detail.lookupRecordId;
    const fieldPosition = event.detail.fieldPosition;
    const column = this._columns.find(
      (column) => column.fieldName === fieldName
    );
    const fieldType = column.type;
    const popUpComponent = this.template.querySelector(
      '[data-id="editCustomPopUpComponent"]'
    );
    popUpComponent.fieldType = fieldType;
    popUpComponent.recordId = recordId;
    popUpComponent.fieldName = fieldName;
    popUpComponent.value = fieldValue;
    popUpComponent.popUpDirections = fieldPosition;
    popUpComponent.numberOfRecordsSelected = this.selectedRows.length;
    if (fieldType === "picklist") {
      popUpComponent.placeholder = column.typeAttributes.placeholder;
      popUpComponent.options = column.typeAttributes.options;
    }
    if (fieldType === "lookup") {
      popUpComponent.searchByApiName = column.typeAttributes.searchByApiName;
      popUpComponent.objectApiName = column.typeAttributes.objectApiName;
      popUpComponent.preValue = preValue;
    }
    popUpComponent.displayPopUp(true);
  }

  handleFieldChanged(event) {
    const updateAlsoSelected = event.detail.updateAlsoSelected;
    const fieldName = event.detail.fieldName;
    const dataRecieved = event.detail.data;
    const newRecords = this.records
      .filter((record) => record[fieldName] !== dataRecieved.value)
      .map((record) => {
        return { ...record };
      });
    const recordsThatChanged = [];
    const selectedRecords = this.selectedRows.map(
      (selectedRecord) => selectedRecord.Id
    );

    for (let newRecord of newRecords) {
      const sameId = newRecord.Id === dataRecieved.recordId;
      if (
        (updateAlsoSelected &&
          (sameId || selectedRecords.includes(newRecord.Id))) ||
        sameId
      ) {
        newRecord[fieldName] = dataRecieved.value;
        recordsThatChanged.push(newRecord.Id);
      }
    }
    this.pushDraftedValues(recordsThatChanged, fieldName, dataRecieved.value);

    // the display value for the lookup is not updated is yet so
    const column = this.columns.find(
      (element) => element.fieldName === fieldName
    );
    if (column.type === "lookup") {
      const newValue = dataRecieved.displayValue;
      const selectedRecords = this.selectedRows.map(
        (selectedRecord) => selectedRecord.Id
      );
      const draftedRecords = this.draftValues.map((drafted) => drafted.Id);
      if (newValue) {
        for (const record of newRecords) {
          if (
            (selectedRecords.includes(record.Id) ||
              record.Id === dataRecieved.recordId) &&
            draftedRecords.includes(record.Id)
          ) {
            record[column.typeAttributes.value.fieldName] = newValue;
          }
        }
      }
    }
    this._records = [...newRecords];
  }
  pushDraftedValues(recordsThatChanged, fieldName, newValue) {
    const staticDataMap = new Map();
    this.staticData.forEach((databaseRecord) => {
      staticDataMap.set(databaseRecord.Id, databaseRecord);
    });
    let finalDrafted = [];
    for (const oldDraft of this.draftValues) {
      //pusheamos primero los viejos y los viejos que cambiaron
      let draftToPush = { ...oldDraft };
      if (recordsThatChanged.includes(oldDraft.Id)) {
        draftToPush[fieldName] = newValue;
      }
      finalDrafted.push(draftToPush);
    }
    let finalDraftedIds = finalDrafted.map((draft) => draft.Id);
    for (const newDraftRecordId of recordsThatChanged) {
      //pusheamos los nuevos
      let draftToPush = {};
      if (!finalDraftedIds.includes(newDraftRecordId)) {
        draftToPush[fieldName] = newValue;
        draftToPush.Id = newDraftRecordId;
        finalDrafted.push(draftToPush);
      }
    }
    let finalFinal = [];
    for (const draft of finalDrafted) {
      let finalDraft = {};
      let changed;
      const databaseRecord = staticDataMap.get(draft.Id); // get the databaseRecord
      for (const field of Object.getOwnPropertyNames(draft)) {
        if (databaseRecord[field] !== draft[field]) {
          //real drafted comparison is made against the databaseRecords
          finalDraft[field] = draft[field];
          changed = true;
        }
      }
      if (changed) {
        finalDraft.Id = draft.Id; //add the ID Property
        finalFinal.push(finalDraft);
      }
    }
    this.draftValues = finalFinal;
  }
}
