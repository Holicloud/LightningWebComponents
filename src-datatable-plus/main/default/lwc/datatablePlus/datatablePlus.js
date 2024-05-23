import LightningDatatable from "lightning/datatable";
import arrayCell from "./arrayCell.html";
import recordCell from "./recordCell.html";
import lightningCheckboxGroupEdit from "./lightningCheckboxGroupEdit.html";
import lightningFormattedNumber from "./lightningFormattedNumber.html";
import lightningInputEdit from "./lightningInputEdit.html";
import lightningComboboxEdit from "./lightningComboboxEdit.html";
import lightningTextAreaEdit from "./lightningTextAreaEdit.html";
import lightningFormattedText from "./lightningFormattedText.html";
import lightningFormattedTime from "./lightningFormattedTime.html";
import lightningRecordPickerEdit from "./lightningRecordPickerEdit.html";
import lookupEdit from "./lookupEdit.html";
import { flatObjectsInArray } from "c/apexRecordsUtils";
import { api } from "lwc";

const customTypes = {
  "c-percent": {
    template: lightningFormattedNumber,
    editTemplate: lightningInputEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  },
  "c-lightning-checkbox-group": {
    template: arrayCell,
    editTemplate: lightningCheckboxGroupEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  },
  "c-time": {
    template: lightningFormattedTime,
    editTemplate: lightningInputEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  },
  "c-picklist": {
    template: arrayCell,
    editTemplate: lightningComboboxEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  },
  "c-textarea": {
    template: lightningFormattedText,
    editTemplate: lightningTextAreaEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  },
  "c-lightning-record-picker": {
    template: recordCell,
    editTemplate: lightningRecordPickerEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  },
  "c-lookup": {
    template: recordCell,
    editTemplate: lookupEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "editString", "viewString"]
  }
};

export default class DatatablePlus extends LightningDatatable {
  static customTypes = customTypes;
  customTypes = customTypes;

  @api
  get records() {
    return this.data;
  }
  set records(value) {
    if (Array.isArray(value)) {
      this.data = flatObjectsInArray(JSON.parse(JSON.stringify(value)));
    }
  }

  @api
  get config() {
    return this.columns;
  }
  set config(columns) {
    if (Array.isArray(columns)) {
      const columnsClone = JSON.parse(JSON.stringify(columns));
      this.formatCustomColumns(columnsClone);
      this.columns = columnsClone;
    }
  }

  formatCustomColumns(columns) {
    for (const column of columns) {
      // some data types in the column type attributes gets transformed when passeed to the cell
      // so optionally we give json string
      if (this.customTypes[column.type]) {
        if (column.typeAttributes.edit) {
          column.typeAttributes.editString = JSON.stringify(column.typeAttributes.edit);
        }
        if (column.typeAttributes.view) {
          column.typeAttributes.viewString = JSON.stringify(column.typeAttributes.view);
        }
      }
    }
  }
}
