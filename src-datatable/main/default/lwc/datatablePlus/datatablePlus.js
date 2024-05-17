import LightningDatatable from "lightning/datatable";
import arrayCell from "./arrayCell.html";
import lightningCheckboxGroupEdit from "./lightningCheckboxGroupEdit.html";
import lightningFormattedNumber from "./lightningFormattedNumber.html";
import lightningInputEdit from "./lightningInputEdit.html";
import lightningCombobox from "./lightningCombobox.html";
import lightningTextArea from "./lightningTextArea.html";
import lightningFormattedText from "./lightningFormattedText.html";
import lightningFormattedTime from "./lightningFormattedTime.html";

const customTypes = {
  "c-percent": {
    template: lightningFormattedNumber,
    editTemplate: lightningInputEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit"]
  },
  "c-lightning-checkbox-group": {
    template: arrayCell,
    editTemplate: lightningCheckboxGroupEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit"]
  },
  "c-time": {
    template: lightningFormattedTime,
    editTemplate: lightningInputEdit,
    standardCellLayout: true,
    typeAttributes: ["view", "edit"]
  },
  "c-picklist": {
    template: arrayCell,
    editTemplate: lightningCombobox,
    standardCellLayout: true,
    typeAttributes: ["view", "edit"]
  },
  "c-textarea": {
    template: lightningFormattedText,
    editTemplate: lightningTextArea,
    standardCellLayout: true,
    typeAttributes: ["view", "edit"]
  }
};

export { customTypes };

export default class DatatablePlus extends LightningDatatable {
  static customTypes = customTypes;
}
