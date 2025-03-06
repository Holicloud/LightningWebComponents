import { LightningElement } from "lwc";

export default class ErrorsAccordionBasic extends LightningElement {
  errors = {
    section1: ["error 1", "error 2", "error 3"],
    section2: ["error 1", "error 2", "error 3"],
    section3: ["error 1", "error 2", "error 3"]
  };
}
