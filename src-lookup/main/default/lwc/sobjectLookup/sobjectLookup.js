import { clone } from "c/utils";
import { reduceErrors } from "c/ldsUtils";
import { flatObjectsInArray } from "c/apexRecordsUtils";
import { LightningElement, api, wire } from "lwc";
import getDatasetRecords from "@salesforce/apex/SObjectLookupController.getDatasetRecords";
import getRecentlyViewed from "@salesforce/apex/SObjectLookupController.getRecentlyViewed";
import getInitialSelection from "@salesforce/apex/SObjectLookupController.getInitialSelection";

export default class SobjectLookup extends LightningElement {
  @api actions;
  @api disabled;
  @api helpText;
  @api isMultiEntry;
  @api label;
  @api minSearchTermLength;
  @api notifyViaAlerts;
  @api placeholder;
  @api required;
  @api scrollAfterNItems;
  @api variant;

  _errors = [];
  _searchResults;
  _selection = [];
  _sets = [];
  _value;
  recentlyViewed = [];

  @api
  get errors() {
    return this._errors;
  }

  set errors(errors) {
    this._errors = errors;
  }

  @api
  get sets() {
    return this.sets;
  }

  set sets(sets) {
    if (Array.isArray(sets) && sets.length) {
      this._sets = clone(sets).map((set) => {
        const { fields } = set;

        // set primary if not defined
        if (!fields.find((field) => field.searchable)) {
          fields[0].primary = true;
        }

        set.searchByFields = fields
          .filter(({ searchable, primary }) => searchable || primary)
          .map(({ fieldName }) => fieldName);
        set.primaryField = fields.find(({ primary }) => primary);
        set.fieldApiNames = fields.map(({ fieldName }) => fieldName);

        return set;
      });
    }
  }

  @api
  get validity() {
    return this.lookupElement?.validity;
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
      this._selection = this.processSearch(data);
    } else if (error) {
      this._errors = reduceErrors(error);
    }
  }

  // gets recentlyViewed that match the each set criteria
  @wire(getRecentlyViewed, { datasets: "$datasets" })
  getRecentlyViewed({ data, error }) {
    if (data) {
      this.recentlyViewed = this.processSearch(data);
    } else if (error) {
      this._errors = reduceErrors(error);
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
        this._errors = reduceErrors(error);
      });
  }

  processSearch(data) {
    const privateData = clone(data);
    const result = [];

    for (let index = 0; index < privateData.length; index++) {
      const { fields, primaryField, icon } = this._sets[index];
      // flat inner objects so that {Id: '1', Owner: {Id: '1'}} becomes => {Id: '1', Owner.id: '1'}
      const setRecords = flatObjectsInArray(privateData[index]);

      result.push(
        setRecords.map((record) => {
          // build the subtitles for each record
          const subtitles = fields
            .filter((field) => !field.primary)
            .map(({ label, fieldName, searchable }) => ({
              label,
              value: record[fieldName],
              highlightSearchTerm: searchable
            }));

          return {
            id: record.Id,
            title: record[primaryField.fieldName],
            icon,
            subtitles
          };
        })
      );
    }

    return result.flat();
  }

  handleChange({ detail }) {
    this._value = detail;
    this.dispatchEvent(new CustomEvent("change", { detail }));
  }

  handleAction({ detail }) {
    this.dispatchEvent(new CustomEvent("action", { detail }));
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
}
