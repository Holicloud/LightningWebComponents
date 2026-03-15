import { LightningElement, api } from "lwc";

export default class Lookup extends LightningElement {
  @api actions;
  @api blur = jest.fn();
  @api checkValidity = jest.fn();
  @api defaultRecords;
  @api disabled;
  @api fieldLevelHelp;
  @api focus = jest.fn();
  @api highlightTittleOnMatch;
  @api isMultiEntry;
  @api label;
  @api messageWhenValueMissing;
  @api minSearchTermLength;
  @api placeholder;
  @api reportValidity = jest.fn();
  @api required;
  @api scrollAfterNItems;
  @api searchHandler;
  @api selectionHandler;
  @api setCustomValidity = jest.fn();
  @api showHelpMessageIfInvalid = jest.fn();
  @api validity;
  @api value;
  @api variant;
}
