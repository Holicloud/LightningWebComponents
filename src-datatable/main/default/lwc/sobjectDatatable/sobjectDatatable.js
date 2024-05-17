import LightningDatatable from "lightning/datatable";
import { api } from "lwc";
import { flatObjectsInArray } from "c/apexRecordsUtils";
import getSObjectFieldConfig from "@salesforce/apex/CustomDataTableController.getSObjectFieldConfig";
import TIME_ZONE from "@salesforce/i18n/timeZone";
import { customTypes } from "c/datatablePlus";
// import DatatablePlus from 'c/datatablePlus';

const TYPES = {
  time: "c-time",
  integer: "number",
  double: "number",
  string: "text",
  datetime: "date",
  percent: "c-percent",
  date: "date-local",
  reference: "lookup",
  picklist: "c-picklist",
  textarea: "c-textarea",
  multipicklist: "c-lightning-checkbox-group"
};

export default class SobjectDatatable extends LightningDatatable {
  static customTypes = {
    ...customTypes
    // "c-lightning-checkbox-group": {
    //   template: arrayCell,
    //   editTemplate: lightningCheckboxGroupEdit,
    //   standardCellLayout: true,
    //   typeAttributes: ["view", "edit"]
    // },
  };

  @api
  get records() {
    return this.data;
  }
  set records(value) {
    if (value.length) {
      this.data = flatObjectsInArray(JSON.parse(JSON.stringify(value)));
    }
  }

  @api
  get config() {
    return this.columns;
  }
  set config(columns) {
    this.setColumnDefaultValuesFromConfig(JSON.parse(JSON.stringify(columns)));
  }

  async setColumnDefaultValuesFromConfig(columns) {
    const configs = columns
      .filter((column) => column.config.source === "SObject")
      .map(({ config }) => ({ field: config.field, objectName: config.object }));

    const fieldDescribes = await getSObjectFieldConfig({ configs });

    for (const column of columns) {
      if (column.config.source !== "SObject") {
        return;
      }
      const fieldDescribe = fieldDescribes[column.config.object + column.config.field];

      column.editable = fieldDescribe.updateable;
      column.sortable = fieldDescribe.sortable;
      column.label = fieldDescribe.label;
      column.type = TYPES[fieldDescribe.type] || fieldDescribe.type;

      switch (fieldDescribe.type) {
        case "datetime":
          column.typeAttributes = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: TIME_ZONE
          };
          break;
        case "currency":
          column.typeAttributes = {
            currencyDisplayAs: "symbol",
            step: 1
          };
          break;
        case "date":
          column.typeAttributes = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            timeZone: "UTC"
          };
          break;
        case "integer":
          column.typeAttributes = {
            minimumFractionDigits: fieldDescribe.scale,
            maximumFractionDigits: fieldDescribe.scale
          };
          break;
        case "double":
          column.typeAttributes = {
            minimumFractionDigits: fieldDescribe.scale,
            maximumFractionDigits: fieldDescribe.scale
          };
          break;
        case "percent":
          column.typeAttributes = {
            view: {
              minimumFractionDigits: fieldDescribe.scale,
              maximumFractionDigits: fieldDescribe.scale,
              formatStyle: "percent-fixed"
            },
            edit: {
              type: "number",
              formatter: "percent-fixed",
              step: ".000000000000000001"
            }
          };
          break;
        case "picklist":
          column.typeAttributes = {
            view: {
              options: fieldDescribe.picklistValues,
              separator: ","
            },
            edit: JSON.stringify({
              options: fieldDescribe.picklistValues
            })
          };
          break;
        case "multipicklist":
          column.typeAttributes = {
            view: {
              options: fieldDescribe.picklistValues,
              separator: ","
            },
            edit: JSON.stringify({
              options: fieldDescribe.picklistValues
            })
          };
          break;
        case "textarea":
          column.typeAttributes = {
            view: {
              linkify: true
            },
            edit: JSON.stringify({
              maxLength: fieldDescribe.length
            })
          };
          break;
        case "time":
          column.typeAttributes = {
            view: {},
            edit: {
              type: "time",
              label: "Time field with placeholder",
              placeholder: "Choose a time"
            }
          };
          break;
        default:
          break;
      }
    }

    this.columns = columns;
  }
}
