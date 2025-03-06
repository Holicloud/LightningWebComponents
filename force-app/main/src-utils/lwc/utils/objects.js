function isObject(value) {
  return (
    typeof value === "object" && value !== null && value.constructor === Object
  );
}

function deepMerge(base = {}, overwrite = {}) {
  // Create a clone of base to avoid mutating it directly
  const clonedBase = Object.assign({}, base);

  for (const key of Reflect.ownKeys(overwrite)) {
    const overwriteValue = overwrite[key];
    const baseValue = clonedBase[key];

    if (isObject(overwriteValue)) {
      // If both base and overwrite are objects, merge them
      clonedBase[key] = deepMerge(baseValue || {}, overwriteValue);
    } else {
      // Otherwise, directly assign overwrite value
      clonedBase[key] = overwriteValue;
    }
  }

  return clonedBase;
}

export { isObject, deepMerge };
