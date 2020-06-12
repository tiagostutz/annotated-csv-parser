const parseValue = (val: string, type: string): number | string | Date => {
  if (
    type === "long" || type === "duration" ||
    type === "unsignedLong"
  ) {
    return parseInt(val);
  } else if (type === "double") {
    return parseFloat(val);
  } else if (type.match(/dateTime/)) {
    return new Date(val);
  } else {
    const escapedVal = val.match(/^"(.*)"$/); //handle the case when the value has commas and is escaped with quotes
    if (escapedVal) {
      return escapedVal[1];
    }

    return val;
  }
};
export const parseAnnotatedCSV = (csvText: string): Array<any> => {
  const rows = csvText.split(/\n/);

  let result: {
    [key: string]: number | string | Date;
  }[][];

  result = [];
  let currentGroup = 0;
  result[currentGroup] = [];
  let isPreviousAnnotationRow = true;
  let attrTypes = new Array<String>();
  let columnNames = new Array<String>();
  let defaultValues = new Array<String>();
  for (const r of rows) {
    const row = r.trim();

    if (row.length === 0) { //a blank separates differente groups in the result. Reset all the temp vars.
      currentGroup++;
      result[currentGroup] = [];
      isPreviousAnnotationRow = true;
      attrTypes = new Array<String>();
      columnNames = new Array<String>();
      defaultValues = new Array<String>();
      continue;
    }

    let cells = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); //match simple commas but also commas inside quotes, like: foo,"hi, dear friend",bar => (foo) (hi, dear friend) (bar)
    cells = cells.slice(1);
    if (row.match(/^#datatype/)) {
      attrTypes = attrTypes.concat(cells);
      isPreviousAnnotationRow = true;
    } else if (row.match(/^#group/)) { // ignoring this information
     } else if (row.match(/^#default/)) {
      defaultValues = defaultValues.concat(cells);
    } else if (!row.match(/^#/) && isPreviousAnnotationRow) { //column names row rached
      columnNames = columnNames.concat(cells);
      isPreviousAnnotationRow = false;
    } else {
      let rowObj: {
        [key: string]: number | string | Date;
      };
      rowObj = {};
      let k = 0;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.length > 0) {
          rowObj[columnNames[i].toString()] = parseValue(
            cell,
            attrTypes[i].toString(),
          );
        } else { //if the value is empty, use the default value
          rowObj[columnNames[i].toString()] = parseValue(
            defaultValues[i].toString(),
            attrTypes[i].toString(),
          );
        }
      }
      result[currentGroup].push(rowObj);
    }
  }

  return result;
};
