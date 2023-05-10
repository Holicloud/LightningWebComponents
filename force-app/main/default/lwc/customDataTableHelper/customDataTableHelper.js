import getFieldInformation from '@salesforce/apex/CustomDataTableController.getFieldInformation';
import TIME_ZONE from '@salesforce/i18n/timeZone';

const TYPES = {
    'integer' : 'number',
    'double' : 'number',
    'string' : 'text',
    'datetime': 'date',
    'percent' : 'percent-fixed',
    'date' : 'date-local',
    'multipicklist' : 'multi-picklist',
}
/**
 * @todo inner "fieldName"  has to apply column.fieldName.split('.').join('_');
 * @return promise
 */
async function formatColumns({ columns, object }) {
    const fieldInformation = await getFieldInformation({
        objectAPIName: object,
        fieldApiNames: columns.map(e => e.fieldName) });

    if (!fieldInformation) {
        return
    }

    String.prototype.equalIgnoreCase = function(str) {
        return str != null && typeof str === 'string' && this.toUpperCase() === str.toUpperCase();
    }

    const result = [];

    for (const column of columns) {

        const fieldDescribe = fieldInformation[
            Object.keys(fieldInformation).find(e => e.equalIgnoreCase(column.fieldName))
        ];

        if (!fieldDescribe || !fieldDescribe.accesible) continue;

        column.editable = column.editable && fieldDescribe.updateable;
        column.sortable = column.sortable && fieldDescribe.sortable;
        column.fieldName = fieldDescribe.name;

        column.label = column.label || fieldDescribe.label;

        if (column.type !== 'button' && !column.override) {
            column.type = TYPES[fieldDescribe.type] || fieldDescribe.type;

            if (fieldDescribe.type === 'datetime') {
                column.typeAttributes = {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: TIME_ZONE
                }
            } else if (fieldDescribe.type === 'currency') {
                column.typeAttributes = {
                    currencyDisplayAs: "symbol"
                }
            } else if (fieldDescribe.type === 'date') {
                column.typeAttributes = {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    timeZone: "UTC"
                }
            } else if (fieldDescribe.type === 'integer' || fieldDescribe.type === 'double') {
                column.typeAttributes = {
                    minimumFractionDigits: fieldDescribe.scale,
                    maximumFractionDigits: fieldDescribe.scale
                }
            } else if (fieldDescribe.type === 'percent') {
                column.typeAttributes = {
                    minimumFractionDigits: fieldDescribe.scale,
                    maximumFractionDigits: fieldDescribe.scale,
                    formatStyle: "percent-fixed"
                }
            } else if (fieldDescribe.type === 'multipicklist') {
                column.typeAttributes = {
                    options: JSON.stringify(fieldDescribe.picklistValues)
                }
            } else if (fieldDescribe.type === 'picklist') {
                column.typeAttributes = {
                    options: JSON.stringify(fieldDescribe.picklistValues)
                }
            }

            // if (['percent', 'picklist', 'reference'].includes(fieldDescribe.type)) {
            //     formatCustomTypes(column, fieldDescribe);
            // }
        }

        result.push(formatfieldNamesProperties(column, column.fieldName));
    }

    return result;
}

function formatCustomTypes(column, fieldDescribe) {
    column.type = typeByFieldDescribeType[fieldDescribe.type] || fieldDescribe.type;
    const { editable, fieldName, type } = column;

    column.typeAttributes = {
        editable,
        fieldName,
        recordId : { fieldName: 'Id' },
        type
    };

    if (fieldDescribe.type === 'percent') {
        column.typeAttributes.maxLength = fieldDescribe.precision > 16 ? 16 : fieldDescribe.precision;
        column.typeAttributes.numberOfDecimal = fieldDescribe.scale;
        column.typeAttributes.value = { fieldName };
    } else if (fieldDescribe.type === 'picklist') {
        column.typeAttributes.placeholder = column.typeAttributes.placeholder || 'Select...';
        column.typeAttributes.value = { fieldName };
    } else if (fieldDescribe.type === 'reference' && !column._isReference) {
        column.typeAttributes = {
            // value : { fieldName: `${column.fieldName.replace('__c','__r')}.Name` },
            // searchByApiName : `Name`,
            // objectApiName : fieldDescribe.referenceTo[0],
            // lookupRecordId : { fieldName },
        };
    }
}

/**
 * @description inner fieldName has to be flattened as well so it can match to a field properly
 */
function formatfieldNamesProperties(object, topLevelFieldName, apexApiNames = new Set()) {

    for (let prop of Object.getOwnPropertyNames(object)) {

        if (typeof object[prop] === 'object') {
            formatfieldNamesProperties(object[prop], topLevelFieldName, apexApiNames);
            continue;
        }

        if (prop === 'fieldName') {

            apexApiNames.add(object.fieldName);

            if (object.fieldName.equalIgnoreCase(topLevelFieldName)) {
                object.fieldName = topLevelFieldName;
            }
        }
    }

    object.apexFieldsReferenced = apexApiNames;
    return object;
}


export {  formatColumns } 