// import LightningDatatable from "lightning/datatable";
import { api } from "lwc";
import getSObjectFieldConfig from "@salesforce/apex/SObjectDatatableController.getSObjectFieldConfig";
import TIME_ZONE from "@salesforce/i18n/timeZone";
import DatatablePlus from "c/datatablePlus";

const TYPES = {
  time: "c-dynamic-cell",
  integer: "c-dynamic-cell",
  double: "c-dynamic-cell",
  string: "text",
  boolean: "boolean",
  datetime: "c-dynamic-cell",
  percent: "c-dynamic-cell",
  date: "c-dynamic-cell",
  picklist: "c-dynamic-cell",
  textarea: "c-dynamic-cell",
  multipicklist: "c-dynamic-cell",
  reference: "c-dynamic-cell"
};

const customTypes = {
  ...DatatablePlus.customTypes,
  myCustomType: {
    template: null,
    editTemplate: null,
    standardCellLayout: true,
    typeAttributes: ["view", "edit"]
  }
};

export default class SobjectDatatable extends DatatablePlus {
  static customTypes = customTypes;
  customTypes = customTypes;

  @api
  get config() {
    return super.config;
  }
  set config(value) {
    if (Array.isArray(value)) {
      const columns = JSON.parse(JSON.stringify(value));
      this.setColumnDefaultValuesFromConfig(columns);
    }
  }

  async setColumnDefaultValuesFromConfig(columns) {
    const configs = columns
      .filter((column) => column.sobjectConfig)
      .map((column) => ({
        field: column.sobjectConfig.field,
        objectName: column.sobjectConfig.object
      }));

    let fieldDescribes;
    try {
      fieldDescribes = await getSObjectFieldConfig({ configs });
    } catch (error) {
      throw new Error("error fetching field config");
    }

    for (const column of columns) {
      if (!column.sobjectConfig) {
        return;
      }
      const fieldDescribe =
        fieldDescribes[
          column.sobjectConfig.object + column.sobjectConfig.field
        ];

      column.editable = fieldDescribe.updateable;
      column.sortable = fieldDescribe.sortable;
      column.label = fieldDescribe.label;
      column.type = TYPES[fieldDescribe.type];

      switch (fieldDescribe.type) {
        case "currency":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedNumber",
              props: {
                currencyDisplayAs: "symbol",
                minimumFractionDigits: fieldDescribe.scale,
                formatStyle: "currency"
              }
            },
            editTemplate: {
              name: "lightningInput",
              props: {
                type: "number",
                formatter: "currency"
              }
            }
          };
          break;
        case "date":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedDateTime",
              props: {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                timeZone: TIME_ZONE
              }
            },
            editTemplate: {
              name: "lightningInput",
              props: {
                type: "date"
              }
            }
          };
          break;
        case "integer":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedNumber",
              props: {
                minimumFractionDigits: fieldDescribe.scale,
                maximumFractionDigits: fieldDescribe.scale
              }
            },
            editTemplate: {
              name: "lightningInput",
              type: "number"
            }
          };
          break;
        case "double":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedNumber",
              props: {
                minimumFractionDigits: fieldDescribe.scale,
                maximumFractionDigits: fieldDescribe.scale
              }
            },
            editTemplate: {
              name: "lightningInput",
              props: {
                type: "number"
              }
            }
          };
          break;
        case "percent":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedNumber",
              props: {
                minimumFractionDigits: fieldDescribe.scale,
                maximumFractionDigits: fieldDescribe.scale,
                formatStyle: "percent-fixed"
              }
            },
            editTemplate: {
              name: "lightningInput",
              prop: {
                type: "number",
                formatter: "percent-fixed",
                step: ".000000000000000001"
              }
            }
          };
          break;
        case "picklist":
          column.typeAttributes = {
            template: {
              name: "array",
              props: {
                options: fieldDescribe.picklistValues,
                separator: ","
              }
            },
            editTemplate: {
              name: "lightningComboboxEdit",
              props: {
                options: fieldDescribe.picklistValues
              }
            }
          };
          break;
        case "multipicklist":
          column.typeAttributes = {
            template: {
              name: "array",
              props: {
                options: fieldDescribe.picklistValues,
                separator: ","
              }
            },
            editTemplate: {
              name: "lightningComboboxEdit",
              props: {
                options: fieldDescribe.picklistValues
              }
            }
          };
          break;
        case "textarea":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedText",
              props: {
                linkify: true
              }
            },
            editTemplate: {
              name: "lightningTextArea",
              props: {
                maxLength: fieldDescribe.length
              }
            }
          };
          break;
        case "time":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedTime",
              props: {}
            },
            editTemplate: {
              name: "lightningInput",
              props: {
                type: "time",
                label: "Time field with placeholder",
                placeholder: "Choose a time"
              }
            }
          };
          break;
        case "reference":
          column.typeAttributes = {
            template: {
              name: "recordCell",
              props: {
                displayField: { fieldApiName: "Name", objectApiName: "Account" }
              }
            },
            editTemplate: {
              name: "lightningRecordPicker",
              props: {
                label: fieldDescribe.referenceTo[0],
                objectApiName: fieldDescribe.referenceTo[0]
              }
            }
          };
          break;
        case "boolean":
          column.typeAttributes = {
            template: {
              name: "lightningFormattedText",
              props: {
                displayField: { fieldApiName: "Name", objectApiName: "Account" }
              }
            },
            editTemplate: {
              name: "lightningInput",
              props: {
                type: "checkbox",
                checked: {
                  fieldName: column.fieldName
                }
              }
            }
          };
          break;
        default:
          break;
      }
    }

    super.config = columns;
  }
}
