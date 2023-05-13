import LightningDatatable from 'lightning/datatable';
import multiPicklist from './multiPicklist.html';
import percentFixed from './percentFixed.html';
import percentFixedEdit from './percentFixedEdit.html';
import picklist from './picklist.html';
import picklistEdit from './picklistEdit.html';
import time from './time.html';

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
        picklist : {
            template: picklist,
            editTemplate: picklistEdit,
            standardCellLayout: true,
            typeAttributes: [
                'options',
                'placeholder',
                'recordTypeId',
                'objectApiName',
                'controllerFieldApiName',
                'rowId'
            ],
        }
    };
}