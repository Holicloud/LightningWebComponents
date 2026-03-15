import { LightningElement, api } from "lwc";
export default class Panel extends LightningElement {
  @api checkValidity = jest.fn();
  @api classes;
  @api icon;
  @api reportValidity = jest.fn();
  @api setCustomValidity = jest.fn();
  @api title;
}
