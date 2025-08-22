import { LightningElement } from "lwc";
import TIME_ZONE from "@salesforce/i18n/timeZone";
import { TYPE } from "c/datatablePlus";
import RECORDS from "./records.js";

const COLUMNS = [
  {
    label: "Date time with formatting",
    fieldName: "CreatedDate",
    type: TYPE,
    typeAttributes: {
      view: "lightning/formattedDateTime",
      edit: "lightning/input",
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
    label: "Email with expected pattern",
    type: TYPE,
    fieldName: "Email__c",
    typeAttributes: {
      view: "lightning/formattedEmail",
      edit: "lightning/input",
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
    label: "Text area with min length",
    fieldName: "TextArea__c",
    type: TYPE,
    typeAttributes: {
      view: "lightning/formattedText",
      edit: "lightning/textarea",
      viewProps: {},
      editProps: {
        minLength: 10
      }
    },
    editable: true
  },
  {
    label: "Url With Tooltip And Validation",
    fieldName: "Url__c",
    type: TYPE,
    typeAttributes: {
      view: "lightning/formattedUrl",
      edit: "lightning/input",
      viewProps: {
        tooltip: "Click Me"
      },
      editProps: {
        type: "url",
        pattern:
          "^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$"
      }
    },
    editable: true
  }
];

export default class DatatablePlusBasic extends LightningElement {
  columns = COLUMNS;
  data = RECORDS;
}
