import { LightningElement, api, track } from "lwc";
import LightningConfirm from "lightning/confirm";
import { DEFAULT_VALUES as DEFAULT_DEPENDENT_VALUES } from "c/employeeDependent";
import { deepMerge, clone, isObject } from "c/utils";

export const LABELS = Object.freeze({
  title: "Employee",
  titleDependents: "Dependents",
  removeEmployeeAndDependents:
    "If you delete this employee, you will delete the whole family.",
  buttons: {
    remove: "Remove",
    addDependent: "Add Dependent"
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
    dateOfBirthGreaterThanToday: "Date Of Birth Cannot Be Greater Than Today",
    invalidNumberOfSpouses: "Max One Spouse Per Employee"
  },
  relationships: {
    self: "Self",
    spouse: "Spouse"
  },
  genders: {
    male: "Male",
    female: "Female"
  },
  status: {
    active: "Active",
    cobra: "Cobra",
    waived: "Waived",
    retiree: "Retiree"
  }
});

const ALLOWED_NUMBER_OF_SPOUSES = 1;

export const DEFAULT_VALUES = Object.freeze({
  gender: LABELS.genders.male,
  relationship: LABELS.relationships.self,
  zipCode: "",
  status: LABELS.status.active,
  dependents: []
});

export default class Employee extends LightningElement {
  @track _record = clone(DEFAULT_VALUES);

  LABELS = LABELS;
  invalidNumberOfSpouses = false;

  genders = [
    { value: LABELS.genders.female, label: LABELS.genders.female },
    { value: LABELS.genders.male, label: LABELS.genders.male }
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
    if (isObject(record)) {
      this._record = clone(record);
      this.rebuildIndexes();
    }
  }

  @api scrollInViewOnError() {
    const valid = this.checkValidity();
    if (!valid) {
      this.refs.panel?.scrollIntoView({ behavior: "smooth" });
    }

    for (const inputCmp of this.template.querySelectorAll(
      "[data-dependent-id]"
    )) {
      if (!inputCmp.checkValidity() && valid) {
        this.template.querySelector('[data-id="dependents"]').isCollapsed =
          false;
        inputCmp?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
  }

  @api reportValidity() {
    this.validateNumberOfSpouses();
    return !!this.refs.panel.reportValidity();
  }

  @api checkValidity() {
    return !!(this.reportValidity() && this.refs.panel.checkValidity());
  }

  @api setCustomValidity(errorMessage, field) {
    this.refs.panel.setCustomValidity(errorMessage, field);
  }

  get todaysDate() {
    return new Date().toISOString().split("T")[0];
  }

  handleChange(event) {
    const value = event.target.value;
    const field = event.target.dataset.input;

    this.record[field] = value;
    this.refs.panel.reportValidity();
    this.sendChangeEvent();
  }

  async handleRemove() {
    if (!this.record?.dependents?.length) {
      this.dispatchEvent(new CustomEvent("remove"));
    } else if (
      await LightningConfirm.open({
        message: LABELS.removeEmployeeAndDependents,
        theme: "warning"
      })
    ) {
      this.dispatchEvent(new CustomEvent("remove"));
    }
  }

  handleAddDependent() {
    const record = DEFAULT_DEPENDENT_VALUES
      ? clone(DEFAULT_DEPENDENT_VALUES)
      : {};
    record.status = this.record.status;
    this.record.dependents.push(record);
    this.rebuildIndexes();
    this.sendChangeEvent();
  }

  handleDependentChange(event) {
    const dependentIndex = parseInt(event.target.dataset.dependentId, 10);
    this.record.dependents[dependentIndex] = deepMerge(
      this.record.dependents[dependentIndex],
      event.detail.record
    );

    this.validateNumberOfSpouses();
    this.sendChangeEvent();
  }

  handleRemovedDependent(event) {
    const dependentIndex = parseInt(event.target.dataset.dependentId, 10);
    const dependents = clone(this.record.dependents);
    dependents.splice(dependentIndex, 1);
    this.record.dependents = dependents;
    this.rebuildIndexes();
    this.sendChangeEvent();
  }

  rebuildIndexes() {
    this.record.dependents.forEach((record, index) => {
      record.index = index;
    });
  }

  sendChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("update", {
        detail: {
          record: clone(this.record)
        }
      })
    );
  }

  hasMoreSpousesThanAllowed() {
    const spouses = this.record.dependents.filter(
      (dependent) => dependent.relationship === LABELS.relationships.spouse
    );

    return spouses.length > ALLOWED_NUMBER_OF_SPOUSES;
  }

  validateNumberOfSpouses() {
    if (this.hasMoreSpousesThanAllowed()) {
      this.invalidNumberOfSpouses = true;
      this.setCustomValidity(LABELS.errors.invalidNumberOfSpouses);
      this.refs.panel.reportValidity();
    } else if (this.invalidNumberOfSpouses) {
      this.invalidNumberOfSpouses = false;
      this.setCustomValidity("");
      this.refs.panel.reportValidity();
    }
  }
}
