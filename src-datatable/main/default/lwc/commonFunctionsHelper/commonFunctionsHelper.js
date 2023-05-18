import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getRecordTypeFromDeveloperName from "@salesforce/apex/CustomDataTableController.getRecordTypeFromDeveloperName";
import { reduceErrors } from "c/ldsUtils";
/**
 * @param  {Array} array
 * @return array of records flattened
 */
function flattenRecords(array) {
  array.forEach((element) => {
    for (const property in element) {
      if (Object.prototype.hasOwnProperty.call(element, property)) {
        const curCol = element[property];
        if (typeof curCol === "object") {
          flattenStructure(element, property + ".", curCol);
        } else {
          // element[property] = element[property];
        }
      }
    }
  });

  return deleteObjectProperties(array);
}

function deleteObjectProperties(array) {
  return array.map((element) => {
    Object.getOwnPropertyNames(element).forEach((property) => {
      if (typeof element[property] === "object") {
        delete element[property];
      }
    });
    return element;
  });
}
/**
 * @param  {object} topObject
 * @param  {string} prefix
 * @param  {any} toBeFlattened
 * @return {void}
 */
function flattenStructure(topObject, prefix, toBeFlattened) {
  for (const prop in toBeFlattened) {
    if (Object.prototype.hasOwnProperty.call(toBeFlattened, prop)) {
      const curVal = toBeFlattened[prop];
      if (typeof curVal === "object") {
        flattenStructure(topObject, prefix + prop + ".", curVal);
      } else {
        topObject[`${prefix}${prop}`] = curVal;
      }
    }
  }
}
/**
 * @param  {string} theString
 * @return boolean
 */
function isBlank(theString) {
  return theString == null || !theString || theString.trim() === "";
}
/**
 * @param  {Array} arrayOfRecords
 * @return new Array of records keeping only OwnPropertyNames
 */
function cloneArray(arrayOfRecords) {
  return JSON.parse(JSON.stringify(arrayOfRecords));
}
/**
 *
 * @param  {string} [message='Unknown Error']
 * @param  {string} [title='Unknown Error']
 * @param  {string} [variant='error']
 * @return new ShowToastEvent
 */
function showToast(
  message = "Unknown Error",
  title = "Unknown Error",
  variant = "error"
) {
  return new ShowToastEvent({
    title,
    message,
    variant
  });
}

function showToastError(
  message = "Unknown Error",
  title = "Unknown Error",
  variant = "error"
) {
  this.dispatchEvent(
    new ShowToastEvent({
      title,
      message,
      variant
    })
  );
}

function showToastApexError(error) {
  this.dispatchEvent(
    new ShowToastEvent({
      title: "Apex Error",
      message: reduceErrors(error).join(", "),
      variant: "error",
      mode: "sticky"
    })
  );
}

let getRecordTypeIdFromDevName = async (developerName, objectApiName) => {
  let recordTypeId;
  await getRecordTypeFromDeveloperName({
    recordTypeDeveloperName: developerName,
    objectApiName: objectApiName
  }).then((result) => {
    recordTypeId = result;
  });
  return recordTypeId;
};
export {
  showToastApexError,
  flattenRecords,
  cloneArray,
  isBlank,
  showToastError,
  showToast,
  getRecordTypeIdFromDevName
};
