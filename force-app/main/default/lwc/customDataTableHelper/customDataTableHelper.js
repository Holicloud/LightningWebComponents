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

const PERCENT_STEP = `.${Array.apply(null, {length: 17}).map(() => '0').join('')}1`;
/**
 * @todo inner "fieldName"  has to apply column.fieldName.split('.').join('_');
 * @return promise
 */
async function formatColumns({ columns, objectApiName }){
    const fieldInformation = await getFieldInformation({
        objectAPIName: objectApiName,
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

        const { accesible, updateable, sortable, name, label, type } = fieldDescribe;

        if (!fieldDescribe || !accesible) continue;

        column.editable = column.editable && updateable;
        column.sortable = column.sortable && sortable;
        column.fieldName = name;

        column.label = column.label || label;

        if (column.type !== 'button' && !column.override) {

            column.type = TYPES[type] || type;
            setTypeAttributes(column, fieldDescribe);
        }

        result.push(formatfieldNamesProperties(column, column.fieldName));
    }

    setParenting(result);

    return result;
}

function setTypeAttributes(column, fieldDescribe) {
    const { type, scale, controllerName, picklistValues } = fieldDescribe;
    switch (type) {
        case 'datetime':
            column.typeAttributes = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: TIME_ZONE
            }
            break;
        case 'currency':
            column.typeAttributes = {
                currencyDisplayAs: "symbol",
                step: 1
            }
            break;
        case 'date':
            column.typeAttributes = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                timeZone: "UTC"
            }
            break;
        case 'integer':
            column.typeAttributes = {
                minimumFractionDigits: scale,
                maximumFractionDigits: scale
            }
            break;
        case 'double':
            column.typeAttributes = {
                minimumFractionDigits: scale,
                maximumFractionDigits: scale
            }
            break;
        case 'percent':
            column.typeAttributes = {
                minimumFractionDigits: scale,
                maximumFractionDigits: scale,
                formatStyle: "percent-fixed",
                step: PERCENT_STEP
            };
            break;
        case 'picklist':
            column.typeAttributes = {
                placeholder: 'Select an Option',
                parentName : controllerName,
                isChild: !!controllerName,
                rowId : { fieldName: 'Id' },
                fieldName: column.fieldName,
                options: JSON.stringify(picklistValues)
            }
            break;
        case 'multipicklist':
            column.typeAttributes = {
                options: JSON.stringify(picklistValues),
                parentName : controllerName,
                isChild: !!controllerName,
            }
            break;
        default:
            break;
    }
}


function setParenting(columns) {
    for (const column of columns) {
        if (!column.override && ['picklist', 'boolean'].includes(column.type)) {

            const child = columns
                .find(c => c.typeAttributes?.parentName === column.fieldName);

            column.typeAttributes = column.typeAttributes || {};
            column.typeAttributes.childName = child?.fieldName;
            column.typeAttributes.isParent = !!child;
        }
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


export { formatColumns } 