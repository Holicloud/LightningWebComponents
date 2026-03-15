import { assert } from "c/utils";

const DEFAULT_SEPARATOR = ",";
const MAX_FILE_SIZE_IN_BYTES = 2000000; // aprox 2.0 MB

const toMegaBytes = (bytes) => bytes / (1024 * 1024);

export { CsvProccessor };

class CsvProccessor {
  #file;
  #headerTransformations = {};
  #maxSize = MAX_FILE_SIZE_IN_BYTES;
  #separator = DEFAULT_SEPARATOR;
  #forEachRecord = () => {};

  #getCsvData = (csvString) => {
    const result = {};
    const records = [];
    const errors = {};
    const lines = csvString.split(/\r\n|\n/);
    const headers = lines[0].split(this.#separator);

    for (let i = 1; i < lines.length; i++) {
      try {
        const currentLine = lines[i].split(this.#separator);

        if (!lines[i].trim().length) {
          continue;
        }

        const record = {};

        headers.forEach((header, index) => {
          const prop = this.#headerTransformations[header] || header;
          record[prop] = currentLine[index];
        });

        this.#forEachRecord(record);
        records.push(record);
      } catch (error) {
        if (!errors[i]) {
          errors[i] = [];
        }

        if (error.errors?.length) {
          for (const singleError of error.errors) {
            errors[i].push(singleError);
          }
        } else {
          errors[i].push(error.message);
        }
      }
    }

    if (Object.keys(errors).length) {
      result.errors = errors;
    } else {
      result.records = records;
    }

    return result;
  };

  #read = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  doForEachRecord(forEachRecord) {
    this.#forEachRecord = forEachRecord;
    return this;
  }

  async getRecords() {
    const result = {};

    if (!this.#file) {
      return result;
    }

    if (this.#file.size > this.#maxSize) {
      throw new Error(
        `File Cannot Be Larger Than ${toMegaBytes(this.#maxSize)}`
      );
    }

    const csvAsString = await this.#read(this.#file);

    return this.#getCsvData(csvAsString);
  }

  setHeaderTranformations(headerTransformations) {
    this.#headerTransformations = headerTransformations;
    return this;
  }

  setMaxSize(maxSize) {
    assert(
      typeof maxSize === "number" && !isNaN(maxSize) && maxSize > 0,
      "Max Size Must Be A Positive Number"
    );
    this.#maxSize = maxSize;
    return this;
  }

  setSeparator(separator) {
    this.#separator = separator;
    return this;
  }

  constructor(file = []) {
    this.#file = file;
  }
}
