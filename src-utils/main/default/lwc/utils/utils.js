import { reduceErrors } from "c/ldsUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export { isBlank, showToastApexError, cloneArray };

/**
 * @param  {Array} arrayOfRecords
 * @return new Array of records keeping only OwnPropertyNames
 */
function cloneArray(arrayOfRecords) {
  return JSON.parse(JSON.stringify(arrayOfRecords));
}

/**
 * @param  {string} theString
 * @return boolean
 */
function isBlank(theString) {
  return theString == null || !theString || theString.trim() === "";
}

function showToastApexError({
  error,
  mode = "sticky",
  title = "Apex Error",
  variant = "error"
}) {
  this.dispatchEvent(
    new ShowToastEvent({
      title,
      message: reduceErrors(error).join(", "),
      variant,
      mode
    })
  );
}
