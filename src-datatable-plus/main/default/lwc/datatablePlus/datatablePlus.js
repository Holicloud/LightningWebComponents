import LightningDatatable from "lightning/datatable";
import dynamicCellProvider from "./dynamicCellProvider.html";
import dynamicEditCellProvider from "./dynamicEditCellProvider.html";
import { flatObjectsInArray } from "c/apexRecordsUtils";
import { api } from "lwc";

export default class DatatablePlus extends LightningDatatable {
  static customTypes = {
    "c-dynamic-cell": {
      template: dynamicCellProvider,
      editTemplate: dynamicEditCellProvider,
      standardCellLayout: true,
      typeAttributes: ["view", "edit", "viewProps", "editProps"]
    }
  };

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
      if (column.type === "c-dynamic-cell") {
        const typeAttributes = column.typeAttributes;
        // when editing for some reason the data can get transformed without intention
        // for example [1,2,3] becomes {0:1,1:2,2:3} so:
        if (typeAttributes.editProps) {
          column.typeAttributes.editProps = JSON.stringify(typeAttributes.editProps);
        }
      }
    }
  }
}
