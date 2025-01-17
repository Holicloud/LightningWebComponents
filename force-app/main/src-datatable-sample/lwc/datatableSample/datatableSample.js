import { LightningElement, wire } from "lwc";
import CHECKBOX_FIELD from "@salesforce/schema/DataTest__c.Checkbox__c";
import CURRENCY_FIELD from "@salesforce/schema/DataTest__c.Currency__c";
import DATE_FIELD from "@salesforce/schema/DataTest__c.Date__c";
import DATETIME_FIELD from "@salesforce/schema/DataTest__c.CreatedDate";
import EMAIL_FIELD from "@salesforce/schema/DataTest__c.Email__c";
import LOOKUP_FIELD from "@salesforce/schema/DataTest__c.OwnerId";
import NAME_FIELD from "@salesforce/schema/DataTest__c.Name";
import PICKLIST_FIELD from "@salesforce/schema/DataTest__c.Picklist__c";
import PICKLISTMULTISELECT_FIELD from "@salesforce/schema/DataTest__c.PicklistMultiSelect__c";
import TEXTAREA_FIELD from "@salesforce/schema/DataTest__c.TextArea__c";
import TIME_FIELD from "@salesforce/schema/DataTest__c.Time__c";
import URL_FIELD from "@salesforce/schema/DataTest__c.Url__c";
import getData from "@salesforce/apex/DatatableSampleController.getData";
import TIME_ZONE from "@salesforce/i18n/timeZone";

const columns = [
  {
    // use dynamic cell to display an text that on input makes a validation
    label: "String",
    fieldName: NAME_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-text",
      edit: "lightning-input",
      viewProps: {},
      editProps: {
        type: "text",
        minLength: 4
      }
    },
    editable: true
  },
  {
    label: "Checkbox",
    fieldName: CHECKBOX_FIELD.fieldApiName,
    type: "boolean",
    editable: true
  },
  {
    label: "Currency",
    fieldName: CURRENCY_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-number",
      edit: "lightning-input",
      viewProps: {
        currencyDisplayAs: "symbol",
        minimumFractionDigits: 2,
        formatStyle: "currency"
      },
      editProps: {
        type: "number",
        formatter: "currency",
        step: "0.01"
      }
    },
    editable: true
  },
  {
    label: "Date",
    fieldName: DATE_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-date-time",
      edit: "lightning-input",
      viewProps: {},
      editProps: {
        type: "date",
        min: "2024-05-01",
        max: "2024-05-31"
      }
    },
    editable: true
  },
  {
    label: "Date time",
    fieldName: DATETIME_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-date-time",
      edit: "lightning-input",
      viewProps: {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
        timezone: TIME_ZONE
      },
      editProps: {
        type: "datetime",
        min: "2024-05-01",
        max: "2024-05-31"
      }
    },
    editable: true
  },
  {
    label: "Email",
    type: "c-dynamic-cell",
    fieldName: EMAIL_FIELD.fieldApiName,
    typeAttributes: {
      view: "lightning-formatted-email",
      edit: "lightning-input",
      viewProps: {
        hideIcon: true
      },
      editProps: {
        type: "email",
        autocomplete: true,
        pattern: ".+@example.com",
        placeholder: "username@example.com",
        messageWhenPatternMismatch: "your email needs to end with example.com"
      }
    },
    editable: true
  },
  {
    label: "Lookup",
    fieldName: LOOKUP_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "c-record",
      edit: "c-lookup",
      viewProps: {
        displayField: "User.Name"
      },
      editProps: {
        uniqueId: "AccountLookup"
      }
    },
    editable: true
  },
  {
    label: "Lookup using lightning-record-picker",
    fieldName: LOOKUP_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "c-record",
      viewProps: {
        displayField: "User.Name"
      },
      edit: "lightning-record-picker",
      editProps: {
        label: "Users",
        placeholder: "Search Users...",
        objectApiName: "User"
      }
    },
    editable: true
  },
  {
    // fixes bug when displaying and editing picklist values
    label: "Picklist",
    fieldName: PICKLIST_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "c-picklist-text",
      edit: "lightning-combobox",
      viewProps: {
        options: [
          { label: "New", value: "new" },
          { label: "In Progress", value: "inProgress" },
          { label: "Finished", value: "finished" }
        ]
      },
      editProps: {
        options: [
          { label: "New", value: "new" },
          { label: "In Progress", value: "inProgress" },
          { label: "Finished", value: "finished" }
        ]
      }
    },
    editable: true
  },
  {
    label: "Picklist (Multi-Select)",
    fieldName: PICKLISTMULTISELECT_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "c-multipicklist-text",
      edit: "lightning-checkbox-group",
      viewProps: {
        options: [
          { label: "New", value: "xd" },
          { label: "In Progress", value: "xd1" },
          { label: "Finished", value: "xd2" }
        ]
      },
      editProps: {
        separator: "|",
        options: [
          { label: "New", value: "xd" },
          { label: "In Progress", value: "xd1" },
          { label: "Finished", value: "xd2" }
        ]
      }
    },
    editable: true
  },
  {
    label: "Text Area",
    fieldName: TEXTAREA_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-text",
      edit: "lightning-textarea",
      viewProps: {},
      editProps: {
        minLength: 10
      }
    },
    editable: true
  },
  {
    label: "Time",
    fieldName: TIME_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-time",
      edit: "lightning-input",
      viewProps: {},
      editProps: {
        type: "time",
        min: "10:30:00.000Z",
        max: "22:00:00.000Z"
      }
    },
    editable: true
  },
  {
    label: "Time",
    fieldName: URL_FIELD.fieldApiName,
    type: "c-dynamic-cell",
    typeAttributes: {
      view: "lightning-formatted-url",
      edit: "lightning-input",
      viewProps: {},
      editProps: {
        type: "url",
        pattern:
          "^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$"
      }
    },
    editable: true
  },
  {
    label: "Relationship field",
    fieldName: "LastModifiedBy.Name"
  }
];

export default class DatatableSample extends LightningElement {
  columns = columns;
  data = [];

  @wire(getData)
  wiredData({ error, data }) {
    if (data) {
      data = JSON.parse(JSON.stringify(data));

      // data transformations required for some types
      for (const record of data) {
        // c-multipicklist-text expects array
        record[PICKLISTMULTISELECT_FIELD.fieldApiName] =
          record[PICKLISTMULTISELECT_FIELD.fieldApiName]?.split(",") || [];

        // lightning-formatted-time expects HH:mm:ss.SSS format
        const timeValue = record[TIME_FIELD.fieldApiName];
        if (timeValue) {
          let timeAsDate = new Date(timeValue).toISOString().slice(11, 23);
          record[TIME_FIELD.fieldApiName] = timeAsDate;
        }
      }

      this.data = data;
    } else if (error) {
      this.data = [];
      console.error("Error:", error);
    }
  }
}
