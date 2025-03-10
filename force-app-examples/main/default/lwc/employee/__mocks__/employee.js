import { LightningElement, api } from "lwc";

export default class Employee extends LightningElement {
  @api record;
  @api scrollInViewOnError = jest.fn();
  @api reportValidity = jest.fn();
  @api checkValidity = jest.fn();
  @api setCustomValidity = jest.fn();
}
