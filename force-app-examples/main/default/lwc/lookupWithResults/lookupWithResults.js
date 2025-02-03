import { LightningElement } from "lwc";
import getRecords from "./records";
const RECORDS = getRecords();

export default class LookupWithResults extends LightningElement {
  // initial multiselect selection
  value = ["6", "7"];

  // a small subset of your data typically first x elements or recently viewed records
  defaultRecords = RECORDS.slice(0, 5);

  getMatching({ rawSearchTerm, searchTerm }) {
    // fetch your records using rawSearchTerm or searchTerm
    return RECORDS.filter((record) => {
      if (
        record.title.includes(rawSearchTerm) ||
        record.title.includes(searchTerm)
      ) {
        return true;
      }

      const firstSubtitle = record.subtitles?.at(0)?.value;

      if (firstSubtitle) {
        return (
          firstSubtitle.includes(rawSearchTerm) ||
          firstSubtitle.includes(searchTerm)
        );
      }

      return false;
    });
  }

  getSelection({ selectedIds }) {
    // fetch your data using the selectedIds
    return RECORDS.filter((record) => selectedIds.includes(record.id));
  }
}
