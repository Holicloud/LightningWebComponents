import LightningDatatable from "lightning/datatable";
import lightningCheckboxGroup from "./lightningCheckboxGroup.html";
import lightningCheckboxGroupEdit from "./lightningCheckboxGroupEdit.html";
import percentFixed from "./percentFixed.html";
import percentFixedEdit from "./percentFixedEdit.html";
import picklist from "./picklist.html";
import picklistEdit from "./picklistEdit.html";
import textareaEdit from "./textareaEdit.html";
import textarea from "./textarea.html";
import time from "./time.html";
import timeEdit from "./timeEdit.html";

export default class DataTablePlus extends LightningDatatable {
  static customTypes = {
    "percent-fixed": {
      template: percentFixed,
      editTemplate: percentFixedEdit,
      standardCellLayout: true,
      typeAttributes: [
        "step",
        "formatStyle",
        "maximumFractionDigits",
        "maximumSignificantDigits",
        "minimumFractionDigits",
        "minimumIntegerDigits",
        "minimumSignificantDigits"
      ]
    },
    time: {
      template: time,
      editTemplate: timeEdit,
      standardCellLayout: true,
      typeAttributes: ["placeholder"]
    },
    "lightning-checkbox-group": {
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
