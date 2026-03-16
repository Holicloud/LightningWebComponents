import { LightningElement, api } from "lwc";
export const closeMock = jest.fn();

export default class LightningModal extends LightningElement {
  @api size;
  @api description;
  @api label;

  close(result) {
    closeMock(result);
  }
}
