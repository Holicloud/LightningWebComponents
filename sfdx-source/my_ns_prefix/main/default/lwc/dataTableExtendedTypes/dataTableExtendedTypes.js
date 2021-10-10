import LightningDatatable from 'lightning/datatable';
//import the template so that it can be reused
import CustomFieldTemplate from './customFieldDataTableTemplate.html';
export default class DataTableExtendedTypes extends LightningDatatable {
    static customTypes = {
        picklist: {
            template: CustomFieldTemplate,
            standardCellLayout: true,
            typeAttributes: ['value', 'recordId', 'fieldName', 'editable', 'type'],
        },
        ['percent-fixed']: {
            template: CustomFieldTemplate,
            standardCellLayout: true,
            typeAttributes: ['value', 'recordId', 'fieldName', 'editable', 'type', 'numberOfDecimals', 'maxLength'],
        },
        lookup: {
            template: CustomFieldTemplate,
            standardCellLayout: true,
            typeAttributes: ['value', 'recordId', 'fieldName', 'editable', 'type', 'lookupRecordId'],
        },
    };
}