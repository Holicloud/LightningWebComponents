export { flatObjectsInArray };
/**
 * @param  {Array} array
 * @return array of records flattened
 */
function flatObjectsInArray(array) {
  array.forEach((element) => {
    Object.getOwnPropertyNames(element).forEach((property) => {
      const curCol = element[property];
      if (typeof curCol === "object") {
        flattenStructure(element, property + ".", curCol);
      } else {
        // element[property] = element[property];
      }
    });
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
