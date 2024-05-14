import LightningDatatable from "lightning/datatable";
import arrayCell from "./arrayCell.html";
import lightningCheckboxGroupEdit from "./lightningCheckboxGroupEdit.html";
import lightningFormattedNumber from "./lightningFormattedNumber.html";
import lightningInputEdit from "./lightningInputEdit.html";
import lightningCombobox from "./lightningCombobox.html";
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
    "c-picklist": {
      template: arrayCell,
      editTemplate: lightningCombobox,
      standardCellLayout: true,
      typeAttributes: ["view", "edit"]
    },
    textarea: {
      template: textarea,
      editTemplate: textareaEdit,
      standardCellLayout: true,
      typeAttributes: ["maxLength", "linkify"]
    }
  };
}
