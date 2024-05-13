import LightningDatatable from "lightning/datatable";
import lightningCheckboxGroup from "./lightningCheckboxGroup.html";
import lightningCheckboxGroupEdit from "./lightningCheckboxGroupEdit.html";
import lightningFormattedNumber from "./lightningFormattedNumber.html";
import lightningInputEdit from "./lightningInputEdit.html";
import picklist from "./picklist.html";
import picklistEdit from "./picklistEdit.html";
import textareaEdit from "./textareaEdit.html";
import textarea from "./textarea.html";
import time from "./time.html";
import timeEdit from "./timeEdit.html";

export default class DataTablePlus extends LightningDatatable {
  static customTypes = {
    "c-percent": {
      template: lightningFormattedNumber,
      editTemplate: lightningInputEdit,
      standardCellLayout: true,
      typeAttributes: [ "view", "edit" ]
    },
    time: {
      template: time,
      editTemplate: timeEdit,
      standardCellLayout: true,
      typeAttributes: ["placeholder"]
    },
    "c-lightning-checkbox-group": {
      template: lightningCheckboxGroup,
      editTemplate: lightningCheckboxGroupEdit,
      standardCellLayout: true,
      typeAttributes: ["typeAttributes"]
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
