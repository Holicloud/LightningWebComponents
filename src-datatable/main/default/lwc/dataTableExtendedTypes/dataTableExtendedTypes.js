import LightningDatatable from "lightning/datatable";
import multipicklist from "./multipicklist.html";
import multipicklistEdit from "./multipicklistEdit.html";
import percentFixed from "./percentFixed.html";
import percentFixedEdit from "./percentFixedEdit.html";
import picklist from "./picklist.html";
import picklistEdit from "./picklistEdit.html";
import textareaEdit from "./textareaEdit.html";
import textarea from "./textarea.html";
import lookup from "./lookup.html";
import lookupEdit from "./lookupEdit.html";
import time from "./time.html";
import timeEdit from "./timeEdit.html";

export default class DataTableExtendedTypes extends LightningDatatable {
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
    multipicklist: {
      template: multipicklist,
      editTemplate: multipicklistEdit,
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
    },
    lookup: {
      template: lookup,
      editTemplate: lookupEdit,
      standardCellLayout: true,
      typeAttributes: ["view", "edit"]
    }
  };
}
