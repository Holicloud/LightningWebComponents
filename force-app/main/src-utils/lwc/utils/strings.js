function isBlank(value) {
  return (
    value === undefined ||
    value === null ||
    typeof value !== "string" ||
    !value.trim()
  );
}

function isNotBlank(value) {
  return !isBlank(value);
}

function convertToISOString(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.valueOf())) {
    throw new Error("Invalid Date");
  }

  return date.toISOString(dateString);
}

function isValidDate(dateStr) {
  const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  const [month, day, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-based
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export { isBlank, isNotBlank, convertToISOString, isValidDate };
