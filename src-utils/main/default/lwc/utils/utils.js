export { isBlank, clone };

function clone(any) {
  return JSON.parse(JSON.stringify(any));
}

/**
 * @param  {string} theString
 * @return boolean
 */
function isBlank(theString) {
  return theString == null || !theString || theString.trim() === "";
}
