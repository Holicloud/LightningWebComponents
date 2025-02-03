import { LightningElement, api } from "lwc";

export default class Lookup extends LightningElement {
  @api actions;
  @api defaultRecords;
  @api disabled;
  @api fieldLevelHelp;
  @api highlightTittleOnMatch;
  @api isMultiEntry;
  @api label;
  @api messageWhenValueMissing;
  @api minSearchTermLength;
  @api placeholder;
  @api required;
  @api scrollAfterNItems;
  @api searchHandler;
  @api selectionHandler;
  @api validity;
  @api value;
  @api variant;
  @api blur() {}
  @api checkValidity() {}
  @api focus() {}
  @api reportValidity() {}
  @api setCustomValidity() {}
  @api showHelpMessageIfInvalid() {}
}
