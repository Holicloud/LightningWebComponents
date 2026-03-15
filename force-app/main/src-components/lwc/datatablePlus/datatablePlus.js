import { TYPE, TYPES } from "c/datatablePlusExtendedTypes";
import { flattenObject } from "c/utils";
import LightningDatatable from "lightning/datatable";
import { api } from "lwc";

export default class DatatablePlus extends LightningDatatable {
  @api
  get records() {
    return this.data;
  }
  set records(value) {
    this.data = value.map((record) => flattenObject(record));
  }
  static customTypes = TYPES;
}
export { TYPE };
