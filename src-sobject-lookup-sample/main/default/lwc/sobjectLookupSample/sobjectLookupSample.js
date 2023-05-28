import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import LightningAlert from "lightning/alert";
import getInitialSelection from "@salesforce/apex/SobjectLookupSampleController.getInitialSelection";

export default class SobjectLookupSample extends NavigationMixin(
  LightningElement
) {
  disabled = false;
  helpText = "some help text";
  isMultiEntry = true;
  label = "label";
  maxSelectionSize = 2;
  minSearchTermLength = 3;
  notifyViaAlerts = false;
  placeholder = "some place holder";
  required = true;
  scrollAfterNItems = 4;
  variant = "label-stacked";
  errors = [];
  value;
  actions = [
    { name: "newAccountAction", label: "New Account" },
    { name: "newOpportunityAction", label: "New Opportunity" }
  ];

  sets = [
    {
      sobjectApiName: "Account",
      icon: "standard:account",
      fields: [
        { label: "Name", fieldName: "Name", primary: true },
        { label: "Phone", fieldName: "Phone" },
        { label: "Owner", fieldName: "Owner.Name" }
      ],
      whereClause: "Id != NULL"
    },
    {
      sobjectApiName: "Opportunity",
      icon: "standard:opportunity",
      fields: [
        { label: "Name", fieldName: "Name", primary: true },
        { label: "StageName", fieldName: "StageName" },
        { label: "Owner", fieldName: "Owner.Name", searchable: true }
      ],
      whereClause: "Id != NULL"
    },
    {
      sobjectApiName: "Contact",
      icon: "standard:contact",
      fields: [
        { label: "Name", fieldName: "Name", primary: true },
        { label: "Email", fieldName: "Email", searchable: true },
        { label: "Title", fieldName: "Title" }
      ],
      whereClause: "Id != NULL"
    }
  ];

  @wire(getInitialSelection)
  wiredData({ error, data }) {
    if (data) {
      this.value = data;
    } else if (error) {
      this.notifyUser(
        "Error",
        "Error while fetching initial selection.",
        "error"
      );
    }
  }

  /**
   * Handles the lookup selection change
   * @param {event} event `change` event emmitted by the lookup.
   * The event contains the list of selected ids.
   */
  // eslint-disable-next-line no-unused-vars
  handleChange(event) {
    this.checkForErrors();
  }

  handleAction(event) {
    if (event.detail === "newAccountAction") {
      this[NavigationMixin.Navigate]({
        type: "standard__objectPage",
        attributes: {
          objectApiName: "Account",
          actionName: "new"
        }
      });
    } else if (event.detail === "newOpportunityAction") {
      this[NavigationMixin.Navigate]({
        type: "standard__objectPage",
        attributes: {
          objectApiName: "Opportunity",
          actionName: "new"
        }
      });
    }
  }

  // All functions below are part of the sample app form (not required by the lookup).

  handleLookupTypeChange(event) {
    this.value = [];
    this.errors = [];
    this.isMultiEntry = event.target.checked;
  }

  handleMaxSelectionSizeChange(event) {
    this.checkForErrors();
    this.maxSelectionSize = event.target.value;
  }

  handleSubmit() {
    this.checkForErrors();
    if (!this.errors.length) {
      this.notifyUser("Success", "The form was submitted.", "success");
    }
  }

  handleClear() {
    this.value = [];
    this.errors = [];
  }

  handleFocus() {
    this.lookupElement.focus();
  }

  checkForErrors() {
    const { value: selection } = this.lookupElement;

    this.errors = [];

    // Custom validation rule
    if (this.isMultiEntry && selection.length > this.maxSelectionSize) {
      this.errors.push({
        message: `You may only select up to ${this.maxSelectionSize} items.`
      });
    }
    // Enforcing required field
    if (!selection.length) {
      this.errors.push({ message: "Please make a selection." });
    }
  }

  async notifyUser(title, message, variant) {
    if (this.notifyViaAlerts) {
      await LightningAlert.open({ message, theme: variant, label: title });
    } else {
      // Notify via toast (only works in LEX)
      this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
  }

  get lookupElement() {
    return this.template.querySelector("c-sobject-lookup");
  }
}
