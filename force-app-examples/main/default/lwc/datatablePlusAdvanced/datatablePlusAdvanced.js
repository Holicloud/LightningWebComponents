import { LightningElement, wire } from "lwc";
import { TYPE } from "c/datatablePlus";
import RECORDS from "./records.js";
import getActiveUsers from "@salesforce/apex/GetUsers.getActiveUsers";

const PICKLIST_INPUT = [
  { label: "New", value: "new" },
  { label: "In Progress", value: "in_progress" },
  { label: "Finished", value: "is_finished" }
];

const BASE_COLUMNS = [
  {
    label: "Using Record Picker",
    fieldName: "OwnerId",
    type: TYPE,
    typeAttributes: {
      view: "c/record",
      viewProps: {
        displayField: "User.Name"
      },
      edit: "lightning/recordPicker",
      editProps: {
        label: "Users",
        placeholder: "Search Users...",
        objectApiName: "User"
      }
    },
    editable: true
  },
  {
    label: "Display a picklist input",
    fieldName: "Picklist__c",
    type: TYPE,
    typeAttributes: {
      view: "c/entry",
      edit: "lightning/combobox",
      viewProps: {
        options: Object.fromEntries(
          PICKLIST_INPUT.map(({ value, label }) => [value, label])
        )
      },
      editProps: {
        dropdownAlignment: "bottom-left",
        options: PICKLIST_INPUT
      }
    },
    editable: true
  },
  {
    label: "Picklist (Multi-Select)",
    fieldName: "PicklistMultiSelect__c",
    type: TYPE,
    typeAttributes: {
      view: "c/entry",
      edit: "lightning/checkboxGroup",
      viewProps: {
        options: Object.fromEntries(
          PICKLIST_INPUT.map(({ value, label }) => [value, label])
        ),
        separator: "|"
      },
      editProps: {
        options: PICKLIST_INPUT
      }
    },
    editable: true
  }
];

export default class DatatablePlusAdvanced extends LightningElement {
  lookupRecords = [];
  baseColumns = BASE_COLUMNS;

  getMatching = ({ rawSearchTerm, searchTerm }) => {
    // fetch your records using rawSearchTerm or searchTerm
    return this.lookupRecords.filter((record) => {
      const raw = rawSearchTerm?.toLowerCase() || "";
      const term = searchTerm?.toLowerCase() || "";
      const title = record.title?.toLowerCase() || "";

      if (title.includes(raw) || title.includes(term)) {
        return true;
      }

      const firstSubtitle = record.subtitles?.at(0)?.value?.toLowerCase();

      if (firstSubtitle) {
        return firstSubtitle.includes(raw) || firstSubtitle.includes(term);
      }

      return false;
    });
  };

  getSelection = ({ selectedIds }) => {
    // fetch your data using the selectedIds
    return this.lookupRecords.filter((record) =>
      selectedIds.includes(record.id)
    );
  };

  get columnsLookup() {
    return [
      {
        label: "Single Lookup",
        fieldName: "OwnerId",
        type: TYPE,
        typeAttributes: {
          view: "c/record",
          edit: "c/lookup",
          viewProps: {
            displayField: "User.Name"
          },
          editProps: {
            searchHandler: this.getMatching,
            selectionHandler: this.getSelection,
            defaultRecords: this.lookupRecords.slice(0, 5),
            label: "Account"
          }
        },
        editable: true
      },
      {
        label: "Lookup Multiple Selection",
        fieldName: "LookupMultiple",
        type: TYPE,
        typeAttributes: {
          view: "c/record",
          edit: "c/lookup",
          viewProps: {
            displayField: "User.Name",
            separator: "|"
          },
          editProps: {
            isMultiEntry: true,
            searchHandler: this.getMatching,
            selectionHandler: this.getSelection,
            defaultRecords: this.lookupRecords.slice(0, 5),
            label: "Account"
          }
        },
        editable: true
      },
      {
        label: "Lookup Multiple Selection (using c/entry)",
        fieldName: "LookupMultiple",
        type: TYPE,
        typeAttributes: {
          view: "c/entry",
          edit: "c/lookup",
          viewProps: {
            options: Object.fromEntries(
              this.lookupRecords.map(({ id, title }) => [id, title])
            ),
            separator: "|"
          },
          editProps: {
            isMultiEntry: true,
            searchHandler: this.getMatching,
            selectionHandler: this.getSelection,
            defaultRecords: this.lookupRecords.slice(0, 5),
            label: "Account"
          }
        },
        editable: true
      }
    ];
  }

  @wire(getActiveUsers)
  wiredUsers({ data }) {
    if (data) {
      this.lookupRecords = [];
      for (const record of data) {
        this.lookupRecords.push({
          id: record.Id,
          title: record.Name,
          icon: {
            iconName: "standard:user"
          },
          subtitles: [
            {
              subtitleLabel: "Profile",
              subtitleType: "lightning/formattedRichText",
              value: record.Profile?.Name
            },
            {
              subtitleLabel: "Email",
              subtitleType: "lightning/email",
              value: record.Email
            }
          ]
        });
      }
    }
  }

  data = RECORDS.slice(0, 7);
}
