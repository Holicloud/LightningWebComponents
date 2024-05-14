import LightningDatatable from "lightning/datatable";
import arrayCell from "./arrayCell.html";
import lightningCheckboxGroupEdit from "./lightningCheckboxGroupEdit.html";
import lightningFormattedNumber from "./lightningFormattedNumber.html";
import lightningInputEdit from "./lightningInputEdit.html";
import picklist from "./picklist.html";
import picklistEdit from "./picklistEdit.html";
import textareaEdit from "./textareaEdit.html";
import textarea from "./textarea.html";
import lightningFormattedTime from "./lightningFormattedTime.html";

export default class DataTablePlus extends LightningDatatable {
  static customTypes = {
    "c-percent": {
      template: lightningFormattedNumber,
      editTemplate: lightningInputEdit,
      standardCellLayout: true,
      typeAttributes: ["view", "edit"]
    },
    "c-lightning-checkbox-group": {
      template: arrayCell,
      editTemplate: lightningCheckboxGroupEdit,
      standardCellLayout: true,
      typeAttributes: ["view", "edit"]
    },
    "c-time": {
      template: lightningFormattedTime,
      editTemplate: lightningInputEdit,
      standardCellLayout: true,
      typeAttributes: ["view", "edit"]
    },
    picklist: {
      template: picklist,
      editTemplate: picklistEdit,
      standardCellLayout: true,
      typeAttributes: ["typeAttributes"]
    },
    textarea: {
      template: textarea,
      editTemplate: textareaEdit,
      standardCellLayout: true,
      typeAttributes: ["maxLength", "linkify"]
    }
  };
}
