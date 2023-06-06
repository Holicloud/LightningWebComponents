import { clone } from "c/utils";
import { reduceErrors } from "c/ldsUtils";
import { flatObjectsInArray } from "c/apexRecordsUtils";
import { LightningElement, api, wire } from "lwc";
import getDatasetRecords from "@salesforce/apex/SObjectLookupController.getDatasetRecords";
import getRecentlyViewed from "@salesforce/apex/SObjectLookupController.getRecentlyViewed";
import getInitialSelection from "@salesforce/apex/SObjectLookupController.getInitialSelection";

export default class SobjectLookup extends LightningElement {
  @api actions;
  @api messageWhenValueMissing;
  @api fieldLevelText;
  @api isMultiEntry;
  @api label;
  @api minSearchTermLength;
  @api notifyViaAlerts;
  @api placeholder;
  @api required;
  @api scrollAfterNItems;
  @api variant;

  _searchResults;
  _initialSelection = [];
  _sets = [];
  _value;
  recentlyViewed = [];
  _disabled = false;

  @api
  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = value;
  }

  @api
  get sets() {
    return this._sets;
  }

  set sets(sets) {
    if (Array.isArray(sets) && sets.length) {
      this._sets = clone(sets).map((set) => {
        const { fields } = set;

        // set primary if not defined
        if (!fields.find(({ searchable }) => searchable)) {
          fields[0].primary = true;
        }

        set.searchByFields = fields
          .filter(({ searchable, primary }) => searchable || primary)
          .map(({ name }) => name);
        set.primaryField = fields.find(({ primary }) => primary);
        set.fieldApiNames = fields.map(({ name }) => name);

        return set;
      });
    }
  }

  @api
  get validity() {
    return this.lookupElement?.validity;
  }

  @api
  checkValidity() {
    return this.lookupElement?.checkValidity();
  }

  @api
  reportValidity() {
    return this.lookupElement?.reportValidity();
  }

  @api
  setCustomValidity(message) {
    return this.lookupElement?.setCustomValidity(message);
  }

  @api
  showHelpMessageIfInvalid() {
    this.lookupElement?.reportValidity();
  }

  @api
  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  @api
  focus() {
    this.lookupElement?.focus();
  }

  @api
  blur() {
    this.lookupElement?.blur();
  }

  // sets the initial selection if there is one
  @wire(getInitialSelection, {
    initialSelection: "$value",
    datasets: "$datasets"
  })
  wiredInitialSelection({ error, data }) {
    if (data) {
      this._initialSelection = this.processSearch(data);
      this._disabled = false;
    } else if (error) {
      this.setCustomValidity(reduceErrors(error).join(", "));
      this.reportValidity();
    }
  }

  // gets recentlyViewed that match the each set criteria
  @wire(getRecentlyViewed, { datasets: "$datasets" })
  getRecentlyViewed({ data, error }) {
    if (data) {
      this.recentlyViewed = this.processSearch(data);
    } else if (error) {
      this.setCustomValidity(reduceErrors(error).join(", "));
      this.reportValidity();
    }
  }

  // gets database data that match set criteria, searchTerm and is not already selected
  handleSearch(event) {
    const { searchTerm, selectedIds } = event.detail;

    getDatasetRecords({ searchTerm, selectedIds, datasets: this.datasets })
      .then((data) => {
        this._searchResults = this.processSearch(data);
      })
      .catch((error) => {
        this.setCustomValidity(reduceErrors(error).join(", "));
        this.reportValidity();
      });
  }

  processSearch(data) {
    const privateData = clone(data);
    const result = [];

    for (let index = 0; index < privateData.length; index++) {
      const { fields, primaryField, icon, name } = this._sets[index];
      // flat inner objects so that {Id: '1', Owner: {Id: '1'}} becomes => {Id: '1', Owner.Id: '1'}
      const setRecords = flatObjectsInArray(privateData[index]);

      for (const record of setRecords) {
        // build the subtitles for each record
        const subtitles = fields
          .filter(({ primary }) => !primary)
          .map(({ label, name: subtitleName, searchable }) => ({
            label,
            value: record[subtitleName],
            highlightSearchTerm: searchable
          }));

        result.push({
          id: record.Id + ":set:" + name,
          title: record[primaryField.name],
          icon,
          subtitles
        });
      }
    }

    return result;
  }

  handleChange({ detail }) {
    const valuesBySet = new Map();

    const data = detail.map((record) => {
      const [id, set] = record.split(":set:");

      if (!valuesBySet.has(set)) {
        valuesBySet.set(set, [id]);
      } else {
        valuesBySet.set(set, [...valuesBySet.get(set), id]);
      }

      return { id, set };
    });

    this._value = data.map(({ id }) => id);
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: this._value,
          valuesBySet
        }
      })
    );
  }

  handleAction({ detail }) {
    this.dispatchEvent(new CustomEvent("action", { detail }));
  }

  handleFocus() {
    this.dispatchEvent(new CustomEvent("focus"));
  }

  handleBlur() {
    this.dispatchEvent(new CustomEvent("blur"));
  }

  get datasets() {
    return JSON.stringify(
      this._sets.map(
        ({ sobjectApiName, searchByFields, fieldApiNames, whereClause }) => ({
          sobjectApiName,
          queryFields: fieldApiNames,
          searchByFields,
          whereClause
        })
      )
    );
  }

  get lookupElement() {
    return this.template.querySelector("c-lookup");
  }

  connectedCallback() {
    if (this.value && this.datasets?.length) {
      this._disabled = true;
    }
  }
}
