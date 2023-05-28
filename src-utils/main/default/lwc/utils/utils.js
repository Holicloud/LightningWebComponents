export { isBlank, clone };

function clone(arrayOfRecords) {
  return JSON.parse(JSON.stringify(arrayOfRecords));
}

/**
 * @param  {string} theString
 * @return boolean
 */
function isBlank(theString) {
  return theString == null || !theString || theString.trim() === "";
}
