import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
const ACCOUNT_ICON = "standard:account";
const OPPORTUNITY_ICON = "standard:opportunity";

export default class SampleLookupContainer extends NavigationMixin(
  LightningElement
) {
  isMultiEntry = false;
  maxSelectionSize = 2;
  initialSelection = [{ id: "1", icon: ACCOUNT_ICON, title: "Account 1" }];

  searchResults = [];

  defaultSearchResults = [...Array(4).keys()].map((e) => ({
    id: "" + e,
    icon: e < 2 ? ACCOUNT_ICON : OPPORTUNITY_ICON,
    title: "Account " + e,
    subtitles: [
      {
        label: "Sub 1",
        value: "Sub 1"
      },
      {
        label: "Account Number",
        value: "" + e,
        highlightSearchTerm: true // hightlight the searchTerm for the subtitle (so that your users know that this field is being used in the search)
      }
    ]
  }));

  actions = [
    { name: "actionA", label: "Custom Action" },
    { name: "actionB", label: "Custom Action B" }
  ];

  handleSearch(event) {
    // eslint-disable-next-line no-unused-vars
    const { selectedIds, searchTerm, rawSearchTerm } = event.detail;
    // get the new data you can use selectedIds, searchTerm, rawSearchTerm to filter the new data example:
    // ID NOT IN :selectedIds, (LIKE title Like '%searchTerm%') OR (Sub 2 LIKE '%searchTerm%')
    this.searchResults = [...Array(10).keys()].map((e) => ({
      id: "" + e,
      icon: e < 5 ? ACCOUNT_ICON : OPPORTUNITY_ICON,
      title: "New data " + e,
      subtitles: [
        {
          label: "Subtitle 1",
          value: "Sub1 " + e
        },
        {
          label: "Sub 2",
          value: "Sub2 " + e,
          highlightSearchTerm: true // hightlight the searchTerm for the subtitle (so that your users know that this field is being used in the search)
        }
      ]
    }));
  }

  // eslint-disable-next-line no-unused-vars
  handleChange(event) {
    const input = this.template.querySelector("c-lookup");
    const { value } = input;
    // Custom validation rule
    if (this.isMultiEntry && value.length > this.maxSelectionSize) {
      input.setCustomValidity(
        `You may only select up to ${this.maxSelectionSize} items.`
      );
    } else {
      input.setCustomValidity(""); // if there was a custom error before, reset it
    }

    input.reportValidity(); // Tells lightning-input to show the error right away without needing interaction
  }

  handleAction(event) {
    if (event.detail === "actionA") {
      // navigate to account page
    } else if (event.detail === "actionB") {
      // navigate to new opportunity page
    }
  }

  // All functions below are part of the sample app form (not required by the lookup).

  handleMultyEntryChange(event) {
    this.isMultiEntry = event.target.checked;
  }

  handleMaxSelectionSizeChange(event) {
    this.maxSelectionSize = event.target.value;
  }

  handleSubmit() {
    const allValid = [
      ...this.template.querySelectorAll("lightning-input"),
      this.template.querySelector("c-lookup")
    ].reduce((validSoFar, inputCmp) => {
      inputCmp.reportValidity();
      return validSoFar && inputCmp.checkValidity();
    }, true);

    if (allValid) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: "The form was submitted.",
          variant: "success"
        })
      );
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "Please update the invalid form entries and try again.",
          variant: "error"
        })
      );
    }
  }

  handleClear() {
    this.initialSelection = [];
  }

  handleFocus() {
    this.template.querySelector("c-lookup").focus();
  }
}
