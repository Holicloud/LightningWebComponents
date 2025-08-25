import LightningDatatable from "lightning/datatable";
import { flattenObject } from "c/utils";
import { api } from "lwc";
import { TYPE, TYPES } from "c/datatablePlusExtendedTypes";
export { TYPE };

export default class DatatablePlus extends LightningDatatable {
  static customTypes = TYPES;

  @api
  get records() {
    return this.data;
  }
  set records(value) {
    this.data = value.map((record) => flattenObject(record));
  }
}
