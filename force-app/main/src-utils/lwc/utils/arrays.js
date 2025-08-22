import { isObject } from "./objects";

function flatObjectsInArray(array) {
  array.forEach((element) => {
    Object.getOwnPropertyNames(element).forEach((property) => {
      const curCol = element[property];
      if (isObject(curCol)) {
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
      if (isObject(element[property])) {
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
      if (isObject(curVal)) {
        flattenStructure(topObject, prefix + prop + ".", curVal);
      } else {
        topObject[`${prefix}${prop}`] = curVal;
      }
    }
  }
}

export { flatObjectsInArray };
