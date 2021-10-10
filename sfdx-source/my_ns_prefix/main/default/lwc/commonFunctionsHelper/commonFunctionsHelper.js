import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecordTypeFromDeveloperName from '@salesforce/apex/CustomDataTableController.getRecordTypeFromDeveloperName';
/**
 * @param  {Array} theArray
 * @return array of records flattened
 */
function flattenRecords(theArray) {
    theArray.forEach(row => {
        for (const col in row) {
            const curCol = row[col];
            if (typeof curCol === 'object') {
                flattenStructure(row, col + '_', curCol);
            } else {
                row[col] = row[col];
            }
        }
    });
    theArray = theArray.map(element => {
        Object.getOwnPropertyNames(element).forEach(field => {
            if (typeof element[field] === 'object') {
                delete element[field];
            }
        });
        return element;
    });
    return theArray;
}
/**
 * @param  {object} topObject
 * @param  {string} prefix
 * @param  {any} toBeFlattened
 * @return {void}
 */
function flattenStructure(topObject, prefix, toBeFlattened) {
    for (const prop in toBeFlattened) {
        const curVal = toBeFlattened[prop];
        if (typeof curVal === 'object') {
            flattenStructure(topObject, prefix + prop + '_', curVal);
        } else {
            topObject[`${prefix}${prop}`] = curVal;
        }
    }
}
/**
 * @param  {string} theString
 * @return boolean
 */
function isBlank(theString) {
    return theString == null || !theString || theString.trim() == '';
}
/**
 * @param  {Array} arrayOfRecords
 * @return new Array of records keeping only OwnPropertyNames
 */
function copyRecordsIntoNewArray(arrayOfRecords) {//since the object retrieved by the query is not extensible we manually copy their properties into a new array of records
    let newArrayOfRecords = [];
    arrayOfRecords.forEach(record => {
        let theNewObject = {};
        Object.getOwnPropertyNames(record).forEach(property => {
            theNewObject[property] = record[property];
        });
        newArrayOfRecords.push(theNewObject);
    });
    return newArrayOfRecords;
}
function showApexErrorMessage(error) {
    let message = 'Unknown error';
    if (Array.isArray(error.body)) {
        message = error.body.map(e => e.message).join(', ');
    } else if (typeof error.body.message === 'string') {
        message = error.body.message;
    }
    return new ShowToastEvent({
        title: 'Apex Error',
        message,
        variant: 'error',
    });
}
/**
 *
 * @param  {string} [message='Unknown Error']
 * @param  {string} [title='Unknown Error']
 * @param  {string} [variant='error']
 * @return new ShowToastEvent
 */
function showToast(message = 'Unknown Error', title = 'Unknown Error', variant = 'error') {
    return new ShowToastEvent({
        title,
        message,
        variant,
    });
}

let getRecordTypeIdFromDevName = async (developerName, objectApiName) => {
    let recordTypeId;
    await getRecordTypeFromDeveloperName({ recordTypeDeveloperName: developerName, objectApiName: objectApiName })
        .then(result => {
            recordTypeId = result;
        });
    return recordTypeId;
}
export { flattenRecords, copyRecordsIntoNewArray, isBlank, showApexErrorMessage, showToast, getRecordTypeIdFromDevName }