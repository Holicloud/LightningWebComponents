import LightningDatatable from 'lightning/datatable';
//import the template so that it can be reused
// import CustomFieldTemplate from './customFieldDataTableTemplate.html';
import percentFixed from './percentFixed.html';
import percentFixedEdit from './percentFixedEdit.html';
import time from './time.html';
import multiPicklist from './multiPicklist.html';
import picklist from './picklist.html';

export default class DataTableExtendedTypes extends LightningDatatable {
    static customTypes = {
        ['percent-fixed']: {
            template: percentFixed,
            editTemplate: percentFixedEdit,
            standardCellLayout: true,
            typeAttributes: [
                'step',
                'formatStyle',
                'maximumFractionDigits',
                'maximumSignificantDigits',
                'minimumFractionDigits',
                'minimumIntegerDigits',
                'minimumSignificantDigits'
            ],
        },
        time: {
            template: time,
            standardCellLayout: true,
        },
        ['multi-picklist'] : {
            template: multiPicklist,
            standardCellLayout: true,
            typeAttributes: ['options'],
        },
        ['picklist'] : {
            template: picklist,
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