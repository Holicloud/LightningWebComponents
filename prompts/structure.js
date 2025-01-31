// see how everything is sorted alfabetically
// there is no line break beetween get/set
import a from "module";
import getRecord from "module";
import { a } from "module";
import { b, track } from "module";
import { c } from "module";
import getRecord from "module";

const CONSTANT_A = "a";
const CONSTANT_B = "b";
const CONSTANT_Z = "kasjdf";

const propertyA = "kasjdf";
const propertyB = "kasjdf";

function propertyB() {}

const propertyM = () => {};

function propertyZ() {}

export default class ComponentReferenceList extends LightningElement {
  // - @api props
  @api apiProp;
  @api apiPropb;
  @api apiPropA;

  // - @tracks props

  @track trackedProp;
  @track trackedPropA;
  @track trackedPropZ;

  // - private props

  a = 1;
  c = 2;
  privateProp;

  // - @api getters/setters

  @api
  get apiGetter() {}
  set apiGetter(value) {}

  @api
  get apiGetterZ() {}
  set apiGetterZ(value) {}

  // - @wire props

  @wire(getRecord)
  wiredRecordB;

  @wire(getRecord)
  wiredRecordC;

  @wire(getRecord)
  wiredRecordY;

  // - @wire functions

  @wire(getRecord)
  doSomething({ data, error }) {
    console.log(data, error);
  }

  @wire(getRecord)
  z({ data, error }) {
    console.log(data, error);
  }

  // - private getters/setters

  get sampleGetterA() {}
  set sampleGetterA(value) {}

  get sampleGetterX() {}
  set sampleGetterX(value) {}

  // - private methods (arrow function properties are considered methods)

  a = () => {
    console.log("method");
  };

  privateMethod() {
    console.log("private");
  }

  // - hooks such as connectedCallback, renderedCallback, errorCallback, etc...


  renderedCallback() {
    console.log("rendered");
  }

  connectedCallback() {
    console.log("connected");
  }

  errorCallback(error) {
    console.error(error);
  }
}
