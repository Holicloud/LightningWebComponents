import LightningDatatable from 'lightning/datatable';
import multipicklist from './multipicklist.html';
import multipicklistEdit from './multipicklistEdit.html';
import percentFixed from './percentFixed.html';
import percentFixedEdit from './percentFixedEdit.html';
import picklist from './picklist.html';
import picklistEdit from './picklistEdit.html';
import textareaEdit from './textareaEdit.html';
import textarea from './textarea.html';
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
        multipicklist : {
            template: multipicklist,
            editTemplate: multipicklistEdit,
            standardCellLayout: true,
            typeAttributes: [
                'parentName',
                'rowId',
                'fieldName',
                'options'
            ],
        },
        picklist : {
            template: picklist,
            editTemplate: picklistEdit,
            standardCellLayout: true,
            typeAttributes: [
                'placeholder',
                'parentName',
                'rowId',
                'fieldName',
                'options'
            ],
        },
        textarea: {
            template: textarea,
            editTemplate: textareaEdit,
            standardCellLayout: true,
            typeAttributes: [ 'maxLength' ],
        }
    };
}