import LightningDatatable from "lightning/datatable";
import multipicklist from "./multipicklist.html";
import multipicklistEdit from "./multipicklistEdit.html";
import percentFixed from "./percentFixed.html";
import percentFixedEdit from "./percentFixedEdit.html";
import picklist from "./picklist.html";
import picklistEdit from "./picklistEdit.html";
import textareaEdit from "./textareaEdit.html";
import textarea from "./textarea.html";
import lookup from "./lookup.html";
import lookupEdit from "./lookupEdit.html";
import time from "./time.html";
import timeEdit from "./timeEdit.html";
import { api } from "lwc";
import { flatObjectsInArray } from "c/apexRecordsUtils";
import { formatColumns } from "c/customDataTableHelper";
import getSObjectFieldConfig from "@salesforce/apex/CustomDataTableController.getSObjectFieldConfig";
import TIME_ZONE from "@salesforce/i18n/timeZone";

const TYPES = {
  integer: "number",
  double: "number",
  string: "text",
  datetime: "date",
  percent: "percent-fixed",
  date: "date-local",
  reference: "lookup"
};

export default class SobjectDatatable extends LightningDatatable {
	static customTypes = {
		"percent-fixed": {
			template: percentFixed,
			editTemplate: percentFixedEdit,
			standardCellLayout: true,
			typeAttributes: [
				"step",
				"formatStyle",
				"maximumFractionDigits",
				"maximumSignificantDigits",
				"minimumFractionDigits",
				"minimumIntegerDigits",
				"minimumSignificantDigits"
			]
		},
		time: {
			template: time,
			editTemplate: timeEdit,
			standardCellLayout: true,
			typeAttributes: ["placeholder"]
		},
		multipicklist: {
			template: multipicklist,
			editTemplate: multipicklistEdit,
			standardCellLayout: true,
			typeAttributes: ["parentName", "rowId", "fieldName", "options"]
		},
		picklist: {
			template: picklist,
			editTemplate: picklistEdit,
			standardCellLayout: true,
			typeAttributes: ["placeholder", "parentName", "rowId", "fieldName", "options"]
		},
		textarea: {
			template: textarea,
			editTemplate: textareaEdit,
			standardCellLayout: true,
			typeAttributes: ["maxLength", "linkify"]
		},
		lookup: {
			template: lookup,
			editTemplate: lookupEdit,
			standardCellLayout: true,
			typeAttributes: ["view", "edit"]
		}
	};

	@api
	get records() {
		return this.data;
	}
	set records(value) {
		if (value.length) {
			this.data = flatObjectsInArray(JSON.parse(JSON.stringify(value)));
		}
	}

	@api
	get config() {
		return this.columns;
	}
	set config(value) {
		this.columns = value;
	}

	async setColumnDefaultValuesFromConfig() {
    const configColumns = this.columns.filter(column => column.config.source === 'SObject');
		const configs = configColumns.map(column => ({ field: column.config.field, objectName: column.config.object }));

		const fieldDescribes = await getSObjectFieldConfig({ configs });

		for (let index = 0; index < configColumns.length; index++) {
			const column = configColumns[index];
			const fieldDescribe = fieldDescribes[index];

			column.editable = fieldDescribe.updateable;
			column.sortable = fieldDescribe.sortable;
			column.label = fieldDescribe.label;

			switch (type) {
				case "datetime":
					column.typeAttributes = {
						year: "numeric",
						month: "numeric",
						day: "numeric",
						hour: "numeric",
						minute: "2-digit",
						timeZone: TIME_ZONE
					};
					break;
				case "currency":
					column.typeAttributes = {
						currencyDisplayAs: "symbol",
						step: 1
					};
					break;
				case "date":
					column.typeAttributes = {
						year: "numeric",
						month: "numeric",
						day: "numeric",
						timeZone: "UTC"
					};
					break;
				case "integer":
					column.typeAttributes = {
						minimumFractionDigits: fieldDescribe.scale,
						maximumFractionDigits: fieldDescribe.scale
					};
					break;
				case "double":
					column.typeAttributes = {
						minimumFractionDigits: fieldDescribe.scale,
						maximumFractionDigits: fieldDescribe.scale
					};
					break;
				case "percent":
					column.typeAttributes = {
						formatStyle: "percent-fixed",
						minimumFractionDigits: fieldDescribe.scale,
						maximumFractionDigits: fieldDescribe.scale,
						step: ".000000000000000001"
					};
					break;
				case "picklist":
					column.typeAttributes = {
						placeholder: "Select an Option",
						options: fieldDescribe.picklistValues
					};
					// options: JSON.stringify(picklistValues)
					break;
				case "multipicklist":
					column.typeAttributes = {
						options: JSON.stringify(picklistValues),
						parentName: controllerName,
						fieldName: column.fieldName,
						rowId: { fieldName: "Id" },
						isChild: !!controllerName
					};
					break;
				case "textarea":
					column.typeAttributes = {
						maxLength: length
					};
					break;
				case "time":
					column.typeAttributes = {
						placeholder: "Choose a Time"
					};
					break;
				case "reference":
					column.typeAttributes = {
						tooltip: 'xd',
						target: '_parent',
						label: 'some labe',
						placeholder: 'some placeholder',
						sets: [
							{
								sobjectApiName: "Account",
								icon: "standard:account",
								fields: [
									{ label: "Name", name: "Name", primary: true },
									{ label: "Phone", name: "Phone" },
									{ label: "Owner", name: "Owner.Name", searchable: true }
								],
								whereClause: "OwnerId != NULL"
							},
							{
								sobjectApiName: "Opportunity",
								icon: "standard:opportunity",
								fields: [
									{ label: "Name", name: "Name", primary: true },
									{ label: "StageName", name: "StageName", searchable: true },
									{ label: "Owner", name: "Owner.Name" }
								],
								whereClause: "StageName != NULL"
							},
						]
					};
					
					break;
				default:
					break;
			}
		}
  }
}
