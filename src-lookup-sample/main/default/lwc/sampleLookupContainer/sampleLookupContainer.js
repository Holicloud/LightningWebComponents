import { LightningElement, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";

/** Apex methods from SampleLookupController */
import search from "@salesforce/apex/SampleLookupController.search";
import getRecentlyViewed from "@salesforce/apex/SampleLookupController.getRecentlyViewed";
const ACCOUNT_ICON = "standard:account";
const OPPORTUNITY_ICON = "standard:opportunity";

export default class SampleLookupContainer extends NavigationMixin(
  LightningElement
) {
  // Use alerts instead of toasts (LEX only) to notify user
  @api notifyViaAlerts = false;

  isMultiEntry = false;
  maxSelectionSize = 2;
  initialSelection = [
    {
      id: "na",
      icon: "standard:lightning_component",
      title: "Inital selection"
    }
  ];
  errors = [];
  recentlyViewed = [];
  actions = [
    { name: "newAccountAction", label: "New Account" },
    { name: "newOpportunityAction", label: "New Opportunity" }
  ];
  searchResults = [];

  /**
   * Loads recently viewed records and set them as default lookpup search results (optional)
   */
  @wire(getRecentlyViewed)
  getRecentlyViewed({ data }) {
    if (data) {
      const [accounts, opportunities] = data;
      this.recentlyViewed = [
        ...this.formatAccounts(accounts),
        ...this.formatOpportunities(opportunities)
      ];
    }
  }

  /**
   * Handles the lookup search event.
   * Calls the server to perform the search and returns the resuls to the lookup.
   * @param {event} event `search` event emmitted by the lookup
   */
  handleLookupSearch(event) {
    // const lookupElement = event.target;
    // Call Apex endpoint to search for records and pass results to the lookup
    search(event.detail)
      .then((data) => {
        const [accounts, opportunities] = data;
        this.searchResults = [
          ...this.formatAccounts(accounts),
          ...this.formatOpportunities(opportunities)
        ];
      })
      .catch((error) => {
        this.notifyUser(
          "Lookup Error",
          "An error occured while searching with the lookup field.",
          "error"
        );
        // eslint-disable-next-line no-console
        console.error("Lookup error", JSON.stringify(error));
        this.errors = [error];
      });
  }

  formatAccounts(accounts) {
    return accounts.map(
      ({ Id, Name, BillingCity, AccountNumber, OwnerId }) => ({
        id: Id,
        title: Name,
        icon: ACCOUNT_ICON,
        subtitle: !BillingCity ? "Account" : "Account • " + BillingCity,
        subtitles: [
          {
            label: "Account Number Label",
            value: AccountNumber,
            highlightSearchTerm: true
          },
          {
            label: "subtitle",
            value: BillingCity,
            highlightSearchTerm: true
          },
          {
            label: "OwnerId",
            value: OwnerId,
            highlightSearchTerm: true
          }
        ]
      })
    );
  }

  formatOpportunities(opportunities) {
    return opportunities.map(
      ({ Id, Name, StageName, LeadSource, OwnerId }) => ({
        id: Id,
        title: Name,
        icon: OPPORTUNITY_ICON,
        subtitles: [
          {
            label: "StageName",
            value: "Opportunity • " + StageName,
            highlightSearchTerm: true
          },
          {
            label: "Sattus",
            value: LeadSource,
            highlightSearchTerm: true
          },
          {
            label: "OwnerId",
            value: OwnerId,
            highlightSearchTerm: true
          }
        ]
      })
    );
  }

  /**
   * Handles the lookup selection change
   * @param {event} event `selectionchange` event emmitted by the lookup.
   * The event contains the list of selected ids.
   */
  // eslint-disable-next-line no-unused-vars
  handleLookupSelectionChange(event) {
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
    this.initialSelection = [];
    this.errors = [];
    this.isMultiEntry = event.target.checked;
  }

  handleMaxSelectionSizeChange(event) {
    this.maxSelectionSize = event.target.value;
  }

  handleSubmit() {
    this.checkForErrors();
    if (this.errors.length === 0) {
      this.notifyUser("Success", "The form was submitted.", "success");
    }
  }

  handleClear() {
    this.initialSelection = [];
    this.errors = [];
  }

  handleFocus() {
    this.template.querySelector("c-lookup").focus();
  }

  checkForErrors() {
    this.errors = [];
    const selection = this.template.querySelector("c-lookup").value;
    // Custom validation rule
    if (this.isMultiEntry && selection.length > this.maxSelectionSize) {
      this.errors.push({
        message: `You may only select up to ${this.maxSelectionSize} items.`
      });
    }
    // Enforcing required field
    if (selection.length === 0) {
      this.errors.push({ message: "Please make a selection." });
    }
  }

  notifyUser(title, message, variant) {
    if (this.notifyViaAlerts) {
      // Notify via alert
      // eslint-disable-next-line no-alert
      alert(`${title}\n${message}`);
    } else {
      // Notify via toast (only works in LEX)
      const toastEvent = new ShowToastEvent({ title, message, variant });
      this.dispatchEvent(toastEvent);
    }
  }
}
