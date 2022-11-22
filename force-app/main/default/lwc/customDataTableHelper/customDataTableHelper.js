import getRecentlyViewedRecords from '@salesforce/apex/CustomDataTableController.getRecentlyViewedRecords';
import getFieldInformation from '@salesforce/apex/CustomDataTableController.getFieldInformation';
import { isBlank, copyRecordsIntoNewArray } from 'c/commonFunctionsHelper';

/**
 * @param  {string} limitOfRecords - '20' - number limit
 * @param  {string} objectApiName - 'Account' - fieldName of the Object
 * @param  {string} offSetNumber - '20' - used by expanded list view to know what records should it query
 * @param  {string} preValue - '001xa000003DIlo' - id value of the record prepopulated
 * @param  {string} queryFields - 'Account__c,Account,Yolo__r.Testo__c' - values separated by a ','
 * @param  {string} searchByApiName - 'Name__c'
 * @param  {string} searchKey - 'sampleString'
 * @param  {string} whereClause - 'ACCOUNT !=NULL && SOMETHING__C='SOMeTHING ELSE'
 * @param  {boolean} displayRecentlyViewed - true - queries In recentlyViewedRecords
 * @param  {string} additionalSearchByFields - 'Name__c,Product.OtherName__c,optionalName' - values separated by a ','
 * @return promise
 */
let buildQuery = async (
	limitOfRecords,
	objectApiName,
	offSetNumber,
	preValue,
	queryFields,
	searchByApiName,
	searchKey,
	whereClause,
	displayRecentlyViewed,
	additionalSearchByFields) => {
    let theWhereClause = '';
    limitOfRecords = isBlank(limitOfRecords) ? '20' : limitOfRecords;
    if (!isBlank(queryFields)) {
        let listOfFields = queryFields.split(',');
        if (listOfFields.includes('ID')) {
            listOfFields.splice(listOfFields.indexOf('ID'), 1);
        }
        if (listOfFields.includes(searchByApiName)) {
            listOfFields.splice(listOfFields.indexOf(searchByApiName), 1);
        }
        queryFields = `,${listOfFields.join(',')}`;
    }
    if (!isBlank(preValue)) {//only apply the ID and custom where condition
        theWhereClause += ` WHERE ID = '${preValue}'`;
        if (!isBlank(whereClause)) {
            theWhereClause += ' AND (' + whereClause + ')';
        }
    } else {
        if (!isBlank(searchKey)) {//apply like if given
            if (isBlank(additionalSearchByFields)) {
                theWhereClause += ` WHERE ${searchByApiName} LIKE '%${searchKey}%'`;
            } else {
                let arrayElements = additionalSearchByFields.split(',').map(element => {
                    return `${element} LIKE '%${searchKey}%'`;
                });
                theWhereClause += `WHERE (${searchByApiName} LIKE '%${searchKey}%' OR ${arrayElements.join(' OR ')})`;
            }
            if (!isBlank(whereClause)) {//aaply where if given
                theWhereClause += ` AND (${whereClause})`;
            }
        } else {//no searchKey and no ID so apply only the where clause
            if (!isBlank(whereClause)) {//aaply where if given
                theWhereClause += ` WHERE (${whereClause})`;
            }
        }
    }
    let theOffSetNumber = '';
    if (!isBlank(offSetNumber)) {
        theOffSetNumber = ' OFFSET ' + offSetNumber;
    }
    let recentlyIds;
    if (displayRecentlyViewed) {
        await getRecentlyViewedRecords({ objectApiName: objectApiName })
            .then(result => {
                if (result && result.length>0) {
                    recentlyIds = `'${result.join(`','`)}'`;
                    if (isBlank(theWhereClause)) {
                        theWhereClause += `WHERE ID IN (${recentlyIds})`;
                    } else {
                        theWhereClause += `AND ID IN (${recentlyIds})`;
                    }
                }
            }).catch(error => {
                if (error.body.message) {
                    this.error = error.body.message;
                }
                recentlyIds = undefined;
            });

    }
    const theQuery = `SELECT ID,${searchByApiName}${queryFields} FROM ${objectApiName} ${theWhereClause} ORDER BY ${searchByApiName} ASC LIMIT ${limitOfRecords}${theOffSetNumber}`;
    return theQuery;
};

/**
 * @todo input has to be of a certain type so change any to a build in object
 * @param  {Array<{apiName: string, fieldName: string}>} columns - array of object where each object represent a column
 * @return aditional Fields formatted
 */
function getApexFields(columns) {
    let apiNames = []
    columns.forEach(column => {
        if (column.apexFieldsReferenced && column.apexFieldsReferenced.length > 0) {
            column.apexFieldsReferenced.forEach(apexField => {
                if (!apiNames.includes(apexField.toUpperCase())) apiNames.push(apexField.toUpperCase());
            });
        }
    });
    return apiNames;
}
/**
 * @todo inner "fieldName"  has to apply column.fieldName.split('.').join('_');
 * @param  {Array<{label: string, fieldName: string, type: string, editable: boolean,fieldNameApiPreserved :string}>} columns - array of object where each object represent a column
 * @return promise
 */
let formatColumns = async (columns, objectApiName) => {
    let fieldInfoMap;
    let fieldApiNames = [];
    let theColumns = copyRecordsIntoNewArray(columns);
    theColumns.forEach(theColumns => {
        if (!fieldApiNames.includes(theColumns.fieldName)) fieldApiNames.push(theColumns.fieldName);
    });
    let getInfo = await getFieldInformation({ objectAPIName: objectApiName, fieldApiNames: fieldApiNames })
        .then(result => {
            fieldInfoMap = new Map(Object.entries(result));
        }).catch(error => {
            fieldInfoMap = undefined;
        });
    let tooManyColumnsButAnother = [];
    theColumns.forEach(column => {
        let newColumn = { ...column };
        const nameOfField = newColumn.fieldName.toUpperCase();
        if (fieldInfoMap && [...fieldInfoMap.keys()].includes(nameOfField)) {
            const apexField = fieldInfoMap.get(nameOfField);
            const fieldDescribe = JSON.parse(apexField.fieldDescribe);
            if (nameOfField.includes('.')) {
                newColumn.editable = false;
            } else {
                newColumn.editable = fieldDescribe.updateable;
            }
            newColumn.fieldName = apexField.fullApiName;
            if (isBlank(newColumn.label)) {
                newColumn.label = fieldDescribe.label;
            }
            if (newColumn.type !== 'button') {
                newColumn.type = fieldDescribe.type;
                switch (fieldDescribe.type) {
                    case 'string':
                        newColumn.type = 'text';
                        break;
                    case 'integer':
                    case 'double':
                        newColumn.type = 'number';
                        break;
                    case 'percent':
                        newColumn.type = 'percent-fixed';//custom datatable type
                        newColumn.typeAttributes = {
                            type: 'percent-fixed',
                            numberOfDecimals: fieldDescribe.scale,
                        }
                        if (fieldDescribe.precision > 16) {
                            newColumn.typeAttributes.maxLength = 16;
                        } else {
                            newColumn.typeAttributes.maxLength = fieldDescribe.precision;
                        }
                        newColumn.typeAttributes.editable = newColumn.editable,
                        newColumn.typeAttributes.fieldName = newColumn.fieldName;
                        newColumn.typeAttributes.recordId = { fieldName: 'Id' };
                        newColumn.typeAttributes.value = { fieldName: newColumn.fieldName };
                        break;
                    case 'picklist':
                        newColumn.type = 'picklist';//custom datatable type
                        if (!newColumn.typeAttributes) {//undefined
                            newColumn.typeAttributes = {
                                type: 'picklist',
                            };
                            if (!newColumn.typeAttributes.placeholder) {
                                newColumn.typeAttributes.placeholder = 'Select...';
                            }
                        }
                        newColumn.typeAttributes.editable = newColumn.editable,
                        newColumn.typeAttributes.fieldName = newColumn.fieldName;
                        newColumn.typeAttributes.recordId = { fieldName: 'Id' };
                        newColumn.typeAttributes.value = { fieldName: newColumn.fieldName };
                        break;
                    case 'reference':
                        if (!newColumn.fieldName.includes('.')) {
                            newColumn.type = 'lookup';//custom datatable type
                            if (!newColumn.typeAttributes) {
                                newColumn.typeAttributes = {
                                    type: 'lookup',
                                };
                            } else {
                                newColumn.typeAttributes = JSON.parse(JSON.stringify(newColumn.typeAttributes));
                                newColumn.typeAttributes.type = 'lookup';
                            }
                            if (!newColumn.typeAttributes.value) {
                                newColumn.typeAttributes.value = { fieldName: `${newColumn.fieldName.replace('__c','__r')}.Name` };
                            }
                            newColumn.typeAttributes.searchByApiName = `Name`;
                            newColumn.typeAttributes.objectApiName = fieldDescribe.referenceTo[0];
                            newColumn.typeAttributes.editable = newColumn.editable,
                            newColumn.typeAttributes.fieldName = newColumn.fieldName;
                            newColumn.typeAttributes.recordId = { fieldName: 'Id' };
                            newColumn.typeAttributes.lookupRecordId = { fieldName: newColumn.fieldName };
                        }
                        break;
                    default:
                        break;
                }
            }
            if (apexField.visible) {
                tooManyColumnsButAnother.push(newColumn);
            }
        }
    });
    let final;
    if (tooManyColumnsButAnother.length>0) {
        final = tooManyColumnsButAnother.map(column => {
            return formatfieldNamesProperties(JSON.parse(JSON.stringify(column)), column.fieldName);
        });

    }
    if (final) return final;
}

/**
 * @param  {string} objectApiName - 'Account' - fieldName of the Object
 * @param  {string} searchByApiName - 'Name__c'
 * @param  {string} searchKey - 'sampleString'
 * @param  {string} whereClause - 'ACCOUNT !=NULL && SOMETHING__C='SOMeTHING ELSE'
 * @param  {string} additionalSearchByFields - 'Name__c,Product.OtherName__c,optionalName' - values separated by a ','
 * @return query string of count() value
 */
function buildQueryCounter(objectApiName, searchByApiName, searchKey, whereClause, additionalSearchByFields) {
    let theWhereClause = '';
    if (!isBlank(searchKey)) {//apply like if given
        if (isBlank(additionalSearchByFields)) {
            theWhereClause += ` WHERE ${searchByApiName} LIKE '%${searchKey}%'`;
        } else {
            let arrayElements = additionalSearchByFields.split(',').map(element => {
                return `${element} LIKE '%${searchKey}%'`;
            });
            theWhereClause += `WHERE (${searchByApiName} LIKE '%${searchKey}%' OR ${arrayElements.join(' OR ')})`;
        }
        if (!isBlank(whereClause)) {//aaply where if given
            theWhereClause += ` AND (${whereClause})`;
        }
    } else {//no searchKey and no ID so apply only the where clause
        if (!isBlank(whereClause)) {//aaply where if given
            theWhereClause += ` WHERE (${whereClause})`;
        }
    }
    const theQuery = `SELECT COUNT() FROM ${objectApiName} ${theWhereClause}`;
    return theQuery;
}
/**
 * @description inner fieldName has to be flattened as well so it can match to a field properly
 * @param  {object} topObject
 * @return {void}Boolean(this.columns && this.limitOfRecords && this.objectApiName && this.searchByApiName && this.whereClause);
 */
function formatfieldNamesProperties(newColumn, trueFieldName, apexApiNames = []) {
    for (let prop of Object.getOwnPropertyNames(newColumn)) {
        const theValue = newColumn[prop];
        if (typeof theValue === 'object') {
            formatfieldNamesProperties(newColumn[prop], trueFieldName, apexApiNames);
            continue;
        }
        if (prop === 'fieldName') {
            if (!apexApiNames.includes(newColumn.fieldName.toUpperCase())) apexApiNames.push(newColumn.fieldName.toUpperCase());
            if (newColumn.fieldName.toUpperCase() === trueFieldName.toUpperCase()) {
                newColumn.fieldName = trueFieldName;
            }
            if (newColumn.fieldName.includes('.')) {
                newColumn.fieldName = newColumn.fieldName.split('.').join('_');
            }
        }
    }
    newColumn.apexFieldsReferenced = apexApiNames;
    return newColumn;
}

/** sort results displayed in the data table */
function sortBy(field, reverse, primer) {
    const key = primer
        ? function (x) {
            return primer(x[field]);
        }
        : function (x) {
            return x[field];
        };

    return function (a, b) {
        a = key(a);
        b = key(b);
        return reverse * ((a > b) - (b > a));
    };
}

export { buildQuery, getApexFields, formatColumns, buildQueryCounter, sortBy }