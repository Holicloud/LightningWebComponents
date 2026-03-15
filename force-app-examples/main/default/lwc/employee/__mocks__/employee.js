import { LightningElement, api } from "lwc";

export default class Employee extends LightningElement {
  @api checkValidity = jest.fn();
  @api record;
  @api reportValidity = jest.fn();
  @api scrollInViewOnError = jest.fn();
  @api setCustomValidity = jest.fn();
}
