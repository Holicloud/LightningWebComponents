import { LightningElement, api } from "lwc";
export default class Panel extends LightningElement {
  @api classes;
  @api icon;
  @api title;
  @api checkValidity = jest.fn();
  @api reportValidity = jest.fn();
  @api setCustomValidity = jest.fn();
}
