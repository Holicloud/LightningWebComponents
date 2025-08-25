import { LightningElement, api } from "lwc";
import template from "./template.html";
import editTemplate from "./editTemplate.html";
const TYPE = "datatable-plus";
const TYPES = {
  [TYPE]: {
    template,
    editTemplate,
    standardCellLayout: true,
    typeAttributes: ["view", "edit", "viewProps", "editProps"]
  }
};

export { TYPE, template, editTemplate, TYPES };

export default class DatatablePlusExtendedTypes extends LightningElement {
  @api getDataTypes() {
    return TYPES;
  }
}
