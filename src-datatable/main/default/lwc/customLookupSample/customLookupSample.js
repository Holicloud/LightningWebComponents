import { LightningElement } from "lwc";
import { showToastError } from "c/commonFunctionsHelper";

export default class CustomLookupSample extends LightningElement {
  iconName = "standard:contact";
  objectApiName = "Account";
  label = "test label";
  value = "";
  whereClause = "Id != NULL";
  required = false;
  limitOfRecords = 10;
  disabled = false;
  helpText = "some help text";
  hideRecentRecords = false;

  fields = [
    { label: "Name", fieldName: "Name", primary: true },
    { label: "Phone", fieldName: "Phone", searchable: true },
    { label: "AccountNumber", fieldName: "AccountNumber", searchable: true },
    { label: "Owner", fieldName: "Owner.Name", searchable: true }
  ];

  get displayFields() {
    return JSON.stringify(this.fields, null, 2);
  }

  handleUpdateParameters() {
    try {
      const newFieldsValue = this.getElementByDataId("fields");
      this.fields = JSON.parse(newFieldsValue.value, null, 2);
    } catch (error) {
      showToastError.call(this, "JSON is invalid");
    }

    this.iconName = this.getElementByDataId("icon").value;
    this.objectApiName = this.getElementByDataId("objectApiName").value;
    this.label = this.getElementByDataId("label").value;
    this.value = this.getElementByDataId("value").value;
    this.required = this.getElementByDataId("required").checked;
    this.whereClause = this.getElementByDataId("whereClause").value;
    this.limitOfRecords = this.getElementByDataId("limitOfRecords").value;
    this.disabled = this.getElementByDataId("disabled").checked;
    this.hideRecentRecords =
      this.getElementByDataId("hideRecentRecords").checked;
    this.helpText = this.getElementByDataId("helpText").value;
  }

  testSubmit() {
    this.getElementByDataId("customLookup").submit();
  }

  getElementByDataId(dataId) {
    return this.template.querySelector(`[data-id="${dataId}"]`);
  }
}
