import { LightningElement, api } from "lwc";
import { assert, isNotBlank } from "c/utils";
import getDefault from "@salesforce/apex/LookupController.getDefault";
import getDefaultNonCacheable from "@salesforce/apex/LookupController.getDefaultNonCacheable";
import getMatching from "@salesforce/apex/LookupController.getMatching";
import getMatchingNonCacheable from "@salesforce/apex/LookupController.getMatchingNonCacheable";
import getSelection from "@salesforce/apex/LookupController.getSelection";
import getSelectionNonCacheable from "@salesforce/apex/LookupController.getSelectionNonCacheable";

export default class ApexLookup extends LightningElement {
  @api actions;
  @api apexClass = "";
  @api disabled;
  @api fieldLevelHelp;
  @api highlightTittleOnMatch;
  @api isMultiEntry;
  @api label;
  @api messageWhenValueMissing;
  @api minSearchTermLength;
  @api nonCacheable = false;
  @api payload = {};
  @api placeholder;
  @api required;
  @api scrollAfterNItems;
  @api value;
  @api variant;

  defaultRecords = [];
  hasRender = false;

  @api
  get validity() {
    return this.refs.lookup.validity;
  }

  @api
  focus() {
    this.refs.lookup.focus();
  }

  @api
  blur() {
    this.refs.lookup.blur();
  }

  @api
  checkValidity() {
    return this.refs.lookup.checkValidity();
  }

  @api
  reportValidity() {
    return this.refs.lookup.reportValidity();
  }

  @api
  setCustomValidity(message) {
    this.refs.lookup.setCustomValidity(message);
  }

  @api
  showHelpMessageIfInvalid() {
    this.refs.lookup.showHelpMessageIfInvalid();
  }

  get getDefaultImplementation() {
    return this.nonCacheable ? getDefaultNonCacheable : getDefault;
  }

  get getSelectionImplementation() {
    return this.nonCacheable ? getSelectionNonCacheable : getSelection;
  }

  get getMatchingImplementation() {
    return this.nonCacheable ? getMatchingNonCacheable : getMatching;
  }

  async renderedCallback() {
    if (!this.hasRender) {
      this.hasRender = true;
      assert(isNotBlank(this.apexClass), "Apex Class is a required Parameter");

      this.refs.lookup.addEventListener("invalid", ({ detail }) =>
        this.dispatchEvent(new CustomEvent("invalid", { detail }))
      );
      this.refs.lookup.addEventListener("focus", ({ detail }) =>
        this.dispatchEvent(new CustomEvent("focus", { detail }))
      );
      this.refs.lookup.addEventListener("blur", ({ detail }) =>
        this.dispatchEvent(new CustomEvent("blur", { detail }))
      );
      this.refs.lookup.addEventListener("action", ({ detail }) =>
        this.dispatchEvent(new CustomEvent("action", { detail }))
      );
      this.refs.lookup.addEventListener("change", ({ detail }) =>
        this.dispatchEvent(new CustomEvent("change", { detail }))
      );

      this.defaultRecords = await this.getDefaultImplementation({
        apexClass: this.apexClass,
        payload: JSON.stringify(this.payload)
      });
    }
  }

  searchHandler = async ({ rawSearchTerm, searchTerm }) => {
    const result = await this.getMatchingImplementation({
      apexClass: this.apexClass,
      searchTerm,
      rawSearchTerm,
      payload: JSON.stringify(this.payload)
    });
    return result;
  };

  selectionHandler = async ({ selectedIds }) => {
    const result = await this.getSelectionImplementation({
      apexClass: this.apexClass,
      selectedIds,
      payload: JSON.stringify(this.payload)
    });

    return result;
  };
}
