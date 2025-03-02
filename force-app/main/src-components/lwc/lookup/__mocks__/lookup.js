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
  @api blur = jest.fn();
  @api checkValidity = jest.fn();
  @api focus = jest.fn();
  @api reportValidity = jest.fn();
  @api setCustomValidity = jest.fn();
  @api showHelpMessageIfInvalid = jest.fn();
}
