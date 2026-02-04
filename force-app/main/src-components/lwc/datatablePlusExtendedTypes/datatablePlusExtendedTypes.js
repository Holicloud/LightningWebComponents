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

async function renderComponent(type, components, defaultType) {
  let result;

  if (typeof type === "function") {
    if (type.prototype instanceof LightningElement) {
      result = type;
    } else {
      const { default: ctor } = await type();
      result = ctor;
    }
  } else if (typeof type === "string") {
    if (components[type]) {
      const { default: ctor } = await components[type]();
      result = ctor;
    } else {
      const { default: ctor } = await import(type);
      result = ctor;
    }
  }

  if (!result) {
    const { default: ctor } = await components[defaultType]();
    result = ctor;
  }

  return result;
}

export { TYPE, template, editTemplate, TYPES, renderComponent };

export default class DatatablePlusExtendedTypes extends LightningElement {
  @api getDataTypes() {
    return TYPES;
  }
}
