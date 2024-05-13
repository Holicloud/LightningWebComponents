import getFieldInformation from "@salesforce/apex/CustomDataTableController.getFieldInformation";
import TIME_ZONE from "@salesforce/i18n/timeZone";

const TYPES = {
  integer: "number",
  double: "number",
  string: "text",
  datetime: "date",
  percent: "c-percent",
  date: "date-local",
  reference: "lookup",
  multipicklist: "c-lightning-checkbox-group"
};

export { formatColumns };

/**
 * @return promise
 */
async function formatColumns({ columns, objectApiName }) {
  try {
    const fieldInformation = await getFieldInformation({
      objectApiName: objectApiName,
      fieldApiNames: columns.map((e) => e.fieldName)
    }).catch((error) => {
      throw error;
    });

    const result = [];

    for (const column of columns) {
      const fieldDescribe =
        fieldInformation[
          Object.keys(fieldInformation).find((e) =>
            equalIgnoreCase(e, column.fieldName)
          )
        ];

      const { accesible, updateable, sortable, name, label, type } =
        fieldDescribe;

      if (!fieldDescribe || !accesible) continue;

      column.editable = column.editable && updateable;
      column.sortable = column.sortable && sortable;
      column.fieldName = name;

      column.label = column.label || label;

      if (column.type !== "button" && !column.override) {
        column.type = TYPES[type] || type;
        setTypeAttributes(column, fieldDescribe);
      }

      const { object, apexApiNames} = formatfieldNamesProperties(column, column.fieldName);
      object.apexFieldsReferenced = apexApiNames;
      result.push(object);
    }

    setParenting(result);

    return { data: result, error: undefined };
  } catch (error) {
    return { data: undefined, error };
  }
}

function equalIgnoreCase(b, a) {
  return (
    a != null && typeof a === "string" && b.toUpperCase() === a.toUpperCase()
  );
}

function setTypeAttributes(column, fieldDescribe) {
  const {
    type,
    scale,
    controllerName,
    controllerLabel,
    picklistValues,
    length,
    referenceTo,
  } = fieldDescribe;

  if (controllerName) {
    column.label += ` (ControlledBy: ${controllerLabel})`;
  }

  switch (type) {
    case "datetime":
      column.typeAttributes = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: TIME_ZONE
      };
      break;
    case "currency":
      column.typeAttributes = {
        currencyDisplayAs: "symbol",
        step: 1
      };
      break;
    case "date":
      column.typeAttributes = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        timeZone: "UTC"
      };
      break;
    case "integer":
      column.typeAttributes = {
        minimumFractionDigits: scale,
        maximumFractionDigits: scale
      };
      break;
    case "double":
      column.typeAttributes = {
        minimumFractionDigits: scale,
        maximumFractionDigits: scale
      };
      break;
    case "percent":
      column.typeAttributes = {
        view: {
          minimumFractionDigits: scale,
          maximumFractionDigits: scale,
          formatStyle: "percent-fixed",
        },
        edit: {
          type: "number",
          formatter: "percent-fixed",
          step: ".000000000000000001"
        }
      };
      break;
    case "picklist":
      column.typeAttributes = {
        typeAttributes: JSON.stringify({
          options: picklistValues,
          placeholder: "Test Placeholder"
        }),
      };
      break;
    case "multipicklist":
      column.typeAttributes = {
        typeAttributes: JSON.stringify({
          options: picklistValues,
        }),
      };
      break;
    case "textarea":
      column.typeAttributes = {
        maxLength: length
      };
      break;
    case "time":
      column.typeAttributes = {
        placeholder: "Choose a Time"
      };
      break;
    case "reference":
      column.typeAttributes = {
        tooltip: 'xd',
        target: '_parent',
        label: 'some labe',
        placeholder: 'some placeholder',
        sets: [
          {
            sobjectApiName: "Account",
            icon: "standard:account",
            fields: [
              { label: "Name", name: "Name", primary: true },
              { label: "Phone", name: "Phone" },
              { label: "Owner", name: "Owner.Name", searchable: true }
            ],
            whereClause: "OwnerId != NULL"
          },
          {
            sobjectApiName: "Opportunity",
            icon: "standard:opportunity",
            fields: [
              { label: "Name", name: "Name", primary: true },
              { label: "StageName", name: "StageName", searchable: true },
              { label: "Owner", name: "Owner.Name" }
            ],
            whereClause: "StageName != NULL"
          },
        ]
      };
      
      break;
    default:
      break;
  }
}

function setParenting(columns) {
  for (const column of columns) {
    if (!column.override && ["picklist", "boolean"].includes(column.type)) {
      const childs = columns.filter(
        (c) => c.typeAttributes?.parentName === column.fieldName
      );

      if (childs) {
        column.typeAttributes = column.typeAttributes || {};
        column.typeAttributes.childs = childs.map((c) => c.fieldName);
        column.typeAttributes.isParent = true;
      }
    }
  }
}

/**
 * @description inner fieldName has to be flattened as well so it can match to a field properly
 */
function formatfieldNamesProperties(
  object,
  topLevelFieldName,
  apexApiNames = new Set()
) {
  for (let prop of Object.getOwnPropertyNames(object)) {
    if (typeof object[prop] === "object") {
      formatfieldNamesProperties(object[prop], topLevelFieldName, apexApiNames);
      continue;
    }

    if (prop === "fieldName") {
      apexApiNames.add(object.fieldName);

      if (equalIgnoreCase(object.fieldName, topLevelFieldName)) {
        object.fieldName = topLevelFieldName;
      }
    }
  }

  return { object, apexApiNames };
}
