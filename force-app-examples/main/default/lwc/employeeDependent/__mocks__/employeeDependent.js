import { LightningElement, api } from "lwc";

export default class EmployeeDependent extends LightningElement {
  @api record;
  @api reportValidity = jest.fn();
  @api setCustomValidity = jest.fn();
  @api checkValidity = jest.fn();
}
