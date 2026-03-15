import { Mixer } from "c/utils";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ApexLookupBasic extends new Mixer().mix(NavigationMixin) {
  actions = [{ name: "newAccountAction", label: "New Account" }];
  isMultiEntry = true;
  maxSelectionSize = 2;
  payload = { accountName: "Edge Communications" };
  value;

  // CPD-OFF
  checkForErrors() {
    if (
      this.isMultiEntry &&
      this.refs.lookup.value?.length > this.maxSelectionSize
    ) {
      this.refs.lookup.setCustomValidity(
        `You may only select up to ${this.maxSelectionSize} items.`
      );
    } else {
      // if there was a custom error before, reset it
      this.refs.lookup.setCustomValidity("");
    }
    // Tells lightning-input to show the error right away without needing interaction
    this.refs.lookup.reportValidity();
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
    }
  }

  handleChange(event) {
    this.checkForErrors();
    this.value = event.detail.value;
  }

  handleClear() {
    this.value = undefined;
    this.refs.lookup.setCustomValidity("");
    this.refs.lookup.reportValidity();
  }

  handleFocus() {
    this.refs.lookup.focus();
  }

  handleLookupTypeChange(event) {
    this.isMultiEntry = event.target.checked;
  }

  handleMaxSelectionSizeChange(event) {
    this.maxSelectionSize = event.target.value;
    this.checkForErrors();
  }

  handleSubmit() {
    this.refs.lookup.reportValidity();

    if (this.refs.lookup.checkValidity()) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: "The form was submitted",
          variant: "success"
        })
      );
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "Verify your input and try again",
          variant: "error"
        })
      );
    }
  }
  // CPD-ON
}
