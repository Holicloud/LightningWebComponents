import LightningDatatable from 'lightning/datatable';
//import the template so that it can be reused
// import CustomFieldTemplate from './customFieldDataTableTemplate.html';
import percentFixedTemplate from './datatableCellPercentFixedTemplate.html';
import timeTemplate from './datatableCellTimeTemplate.html';
import dataTableCellMultiPicklistTemplate from './dataTableCellMultiPicklistTemplate.html';
export default class DataTableExtendedTypes extends LightningDatatable {
    static customTypes = {
        ['percent-fixed']: {
            template: percentFixedTemplate,
            standardCellLayout: true,
            typeAttributes: [
                'formatStyle',
                'maximumFractionDigits',
                'maximumSignificantDigits',
                'minimumFractionDigits',
                'minimumIntegerDigits',
                'minimumSignificantDigits'
            ],
        },
        time: {
            template: timeTemplate,
            standardCellLayout: true,
        },
        ['multi-picklist'] : {
            template: dataTableCellMultiPicklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['options'],
        },
        ['picklist'] : {
            template: dataTableCellMultiPicklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['options'],
        }
        // picklist: {
        //     template: CustomFieldTemplate,
        //     standardCellLayout: true,
        //     typeAttributes: ['value', 'recordId', 'fieldName', 'editable', 'type'],
        // },
        
        // lookup: {
        //     template: CustomFieldTemplate,
        //     standardCellLayout: true,
        //     typeAttributes: ['value', 'recordId', 'fieldName', 'editable', 'type', 'lookupRecordId'],
        // },
    };
}