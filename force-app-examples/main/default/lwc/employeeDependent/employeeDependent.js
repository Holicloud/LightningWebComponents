import { LightningElement, api, track } from "lwc";
import { clone } from "c/utils";

const LABELS = Object.freeze({
  title: "Dependent",
  buttons: {
    remove: "Remove"
  },
  inputs: {
    dateOfBirth: "Date Of Birth",
    firstName: "First Name",
    gender: "Gender",
    lastName: "Last Name",
    middleInitial: "Middle Initial",
    relationship: "Relationship",
    status: "Status",
    zipCode: "Zip Code"
  },
  errors: {
    zipCodePatternMissMatch: "Invalid Zip Code",
    dateOfBirthGreaterThanToday: "Date Of Birth Cannot Be Greater Than Today"
  },
  genders: {
    male: "Male",
    female: "Female"
  },
  relationships: {
    spouse: "Spouse",
    child: "Child",
    disabledDependent: "Disabled Dependent",
    other: "Other"
  },
  status: {
    active: "Active",
    cobra: "Cobra",
    waived: "Waived",
    retiree: "Retiree"
  }
});

export const DEFAULT_VALUES = Object.freeze({
  gender: LABELS.genders.male,
  relationship: LABELS.relationships.other,
  zipCode: "",
  status: LABELS.status.active
});

export default class EmployeeDependent extends LightningElement {
  @track _record = clone(DEFAULT_VALUES);

  LABELS = LABELS;

  genders = [
    { value: LABELS.genders.female, label: LABELS.genders.female },
    { value: LABELS.genders.male, label: LABELS.genders.male }
  ];

  relationships = [
    { value: LABELS.relationships.child, label: LABELS.relationships.child },
    {
      value: LABELS.relationships.disabledDependent,
      label: LABELS.relationships.disabledDependent
    },
    { value: LABELS.relationships.other, label: LABELS.relationships.other },
    { value: LABELS.relationships.spouse, label: LABELS.relationships.spouse }
  ];

  statusOptions = [
    { value: LABELS.status.active, label: LABELS.status.active },
    { value: LABELS.status.cobra, label: LABELS.status.cobra },
    { value: LABELS.status.retiree, label: LABELS.status.retiree },
    { value: LABELS.status.waived, label: LABELS.status.waived }
  ];

  @api
  get record() {
    return this._record;
  }
  set record(record) {
    this._record = clone(record);
  }

  @api reportValidity() {
    return this.refs.panel.reportValidity();
  }

  @api checkValidity() {
    return this.refs.panel.checkValidity();
  }

  @api setCustomValidity(errorMessage, field) {
    this.refs.panel.setCustomValidity(errorMessage, field);
  }

  get todaysDate() {
    return new Date().toISOString().split("T")[0];
  }

  handleChange(event) {
    event.preventDefault();
    event.stopPropagation();

    const value = event.target.value;
    const field = event.target.dataset.input;
    this._record[field] = value;

    this.refs.panel.reportValidity();
    this.dispatchEvent(
      new CustomEvent("update", {
        detail: {
          record: clone(this.record)
        }
      })
    );
  }

  handleRemove() {
    this.dispatchEvent(new CustomEvent("remove"));
  }
}
