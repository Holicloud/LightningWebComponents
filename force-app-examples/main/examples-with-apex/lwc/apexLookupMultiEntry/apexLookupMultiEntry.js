import { Mix } from "c/utils";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ApexLookupMultiEntry extends Mix(NavigationMixin) {
  value;
  payload = { accountName: "Edge Communications" };
  actions = [{ name: "newAccountAction", label: "New Account" }];

  handleChange(event) {
    this.checkForErrors();
    this.value = event.detail.value;
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

  handleClear() {
    this.value = [];
    this.refs.lookup.setCustomValidity("");
    this.refs.lookup.reportValidity();
  }

  checkForErrors() {
    if (this.isMultiEntry && this.refs.lookup.value?.length > 2) {
      this.refs.lookup.setCustomValidity(`You may only select up to 2 items.`);
    } else {
      // if there was a custom error before, reset it
      this.refs.lookup.setCustomValidity("");
    }
    // Tells lightning-input to show the error right away without needing interaction
    this.refs.lookup.reportValidity();
  }
}
