import { LightningElement, api } from "lwc";

export default class EmployeeDependent extends LightningElement {
  @api checkValidity = jest.fn();
  @api record;
  @api reportValidity = jest.fn();
  @api setCustomValidity = jest.fn();
}
