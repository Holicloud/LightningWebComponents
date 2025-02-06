import { LightningElement, api, track } from "lwc";
import {
  classSet,
  classListMutation,
  clone,
  assert,
  isBlank,
  isNotBlank,
  executeAfterRender
} from "c/utils";

const INPUT_SEARCH_DELAY = 300;

const KEY_INPUTS = {
  ESCAPE: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ENTER: 13,
  DEL: 46,
  BACKSPACE: 8,
  SPACE: 32
};

// HTML formatting for matched search terms
const BOLD_MATCHER_REGEX = "<strong>$1</strong>";

// Variants for label styling
const VARIANTS = {
  LABEL_STACKED: "label-stacked",
  LABEL_INLINE: "label-inline",
  LABEL_HIDDEN: "label-hidden"
};

// Regex for filtering out special SOSL characters
const REGEX_SOSL_RESERVED =
  /(\?|&|\||!|\{|\}|\[|\]|\(|\)|\^|~|\*|:|"|\+|-|\\)/g;
const REGEX_EXTRA_TRAP = /(\$|\\)/g;

const LABELS = {
  noResults: "No results.",
  loading: "Loading...",
  searchIcon: "Search Icon",
  removeOption: "Remove selected option",
  errors: {
    labelRequired: "label is required",
    completeThisField: "Complete this field.",
    errorFetchingData: "Error Fetching Data"
  }
};

const MIN_SEARCH_TERM_LENGTH = 2;
const SCROLL_AFTER_N = "*";

const DEFAULT_LABEL = "Select";

export default class Lookup extends LightningElement {
  @api actions = [];

  @api disabled = false;
  @api fieldLevelHelp = "";
  @api highlightTittleOnMatch = false;
  @api isMultiEntry = false;
  @api messageWhenValueMissing = LABELS.errors.completeThisField;
  @api placeholder = "";
  @api required = false;
  @api scrollAfterNItems = SCROLL_AFTER_N;
  @api searchHandler = () => [];
  @api selectionHandler = () => [];

  @track recordsDropdown = [];

  _defaultRecords = [];
  _label = DEFAULT_LABEL;
  _minSearchTermLength = MIN_SEARCH_TERM_LENGTH;
  _scrollAfterNItems = SCROLL_AFTER_N;
  _variant = VARIANTS.LABEL_STACKED;

  cancelBlur = false;
  cleanSearchTerm;
  displayListBox = false;
  displayMatching = false;
  focusedResultIndex = null;
  hasFocus = false;
  hasInit = false;
  helpMessage;
  isLoading = true;
  labels = LABELS;
  records = new Map();
  searchTerm = "";
  searchThrottlingTimeout;
  showHelpMessage = false;

  @api
  get defaultRecords() {
    return this._defaultRecords;
  }
  set defaultRecords(value) {
    this._defaultRecords = value;

    if (this.hasInit) {
      this.setDefaultRecords();
      this.updateDropdownOfRecords();
    }
  }

  @api
  get label() {
    return this._label;
  }
  set label(value) {
    this._label = isNotBlank(value) ? value : DEFAULT_LABEL;
  }

  @api
  get minSearchTermLength() {
    return this._minSearchTermLength;
  }
  set minSearchTermLength(value) {
    if (Number.isInteger(value)) {
      this._minSearchTermLength =
        value < MIN_SEARCH_TERM_LENGTH ? MIN_SEARCH_TERM_LENGTH : value;
    } else {
      this._minSearchTermLength = MIN_SEARCH_TERM_LENGTH;
    }
  }

  @api
  get variant() {
    return this._variant;
  }
  set variant(value) {
    this._variant = Object.values(VARIANTS).includes(value)
      ? value
      : VARIANTS.LABEL_STACKED;
    this.updateClassList();
  }

  @api
  get value() {
    return this.isMultiEntry
      ? this.selectedRecords.map((record) => record.id)
      : this.selectedRecords[0]?.id;
  }
  set value(value) {
    const currentValue = this.isMultiEntry
      ? clone(this.value).sort().toString()
      : this.value;

    let selectedIds = [];

    if (this.isSingleEntry && isNotBlank(value)) {
      selectedIds = [value];
    } else if (Array.isArray(value) && value.length) {
      selectedIds = value;
    }

    // unmark items not selected
    for (const { record } of Array.from(this.records.values())) {
      if (!selectedIds.includes(record.id)) {
        this.upsertRecord(record.id, { selected: false });
      }
    }

    // mark items as selected
    selectedIds
      .filter((recordId) => isNotBlank(recordId))
      .forEach((recordId) => this.upsertRecord(recordId, { selected: true }));

    // if the value trully changed then use then update via selectionHandler
    const newValue = this.isMultiEntry
      ? this.value.sort().toString()
      : this.value;
    if (this.hasInit && currentValue !== newValue) {
      this.updateValue();
    }
  }

  @api
  get validity() {
    return { valid: Boolean(!this.hasMissingValue() && !this.helpMessage) };
  }

  @api
  focus() {
    if (this.refs.input) {
      this.refs.input.focus();
      this.refs.input.dispatchEvent(new CustomEvent("focus"));
    } else {
      executeAfterRender(() => {
        this.refs.input.focus();
        this.refs.input.dispatchEvent(new CustomEvent("focus"));
      });
    }
  }

  @api
  blur() {
    if (this.refs.input) {
      this.refs.input.blur();
      this.refs.input.dispatchEvent(new CustomEvent("blur"));
    } else {
      executeAfterRender(() => {
        this.refs.input.blur();
        this.refs.input.dispatchEvent(new CustomEvent("blur"));
      });
    }
  }

  @api
  checkValidity() {
    const valid = this.validity.valid;

    if (!valid) {
      this.dispatchEvent(new CustomEvent("invalid", { cancellable: true }));
    }

    return valid;
  }

  @api
  reportValidity() {
    if (this.hasMissingValue()) {
      this.helpMessage = this.messageWhenValueMissing;
    } else if (this.helpMessage === this.messageWhenValueMissing) {
      this.helpMessage = "";
    }

    const valid = this.checkValidity();

    this.classList.toggle("slds-has-error", !valid);

    this.showHelpMessage = !valid;

    return valid;
  }

  @api
  setCustomValidity(message) {
    this.helpMessage = message;
  }

  @api
  showHelpMessageIfInvalid() {
    this.reportValidity();
  }

  // template getters

  get getContainerClass() {
    return classSet("slds-combobox_container")
      .add({ "has-custom-error": this.helpMessage })
      .toString();
  }

  get getDropdownClass() {
    const isSelectionAllowed = this.isMultiEntry || !this.hasSelection(),
      isSearchTermValid =
        this.cleanSearchTerm?.length >= this.minSearchTermLength,
      hasItems = this.recordsDropdown?.length || this.actions?.length;

    return classSet("slds-combobox")
      .add("slds-dropdown-trigger")
      .add("slds-dropdown-trigger_click")
      .add({
        "slds-is-open":
          this.displayListBox &&
          isSelectionAllowed &&
          (hasItems || isSearchTermValid)
      })
      .toString();
  }

  get getInputClass() {
    const css = classSet("slds-input")
      .add("slds-combobox__input")
      .add("has-custom-height")
      .add({
        "slds-has-focus": this.hasFocus && this.recordsDropdown?.length
      })
      .add({ "has-custom-error": this.helpMessage });

    if (this.isSingleEntry) {
      css.add("slds-combobox__input-value");
      css.add({ "has-custom-border": this.hasSelection() });
    }

    return css.toString();
  }

  get getComboboxClass() {
    const iconClass =
      this.isMultiEntry || !this.hasSelection()
        ? "slds-input-has-icon_right"
        : "slds-input-has-icon_left-right";

    return classSet("slds-combobox__form-element")
      .add("slds-input-has-icon")
      .add(iconClass)
      .toString();
  }

  get getSearchIconClass() {
    return classSet("slds-input__icon")
      .add("slds-input__icon_right")
      .add({ "slds-hide": this.isSingleEntry && this.hasSelection() })
      .toString();
  }

  get getClearSelectionButtonClass() {
    return classSet("slds-button")
      .add("slds-button_icon")
      .add("slds-input__icon")
      .add("slds-input__icon_right")
      .add({ "slds-hide": !this.hasSelection() })
      .toString();
  }

  get getSelectIconClass() {
    return classSet("slds-combobox__input-entity-icon")
      .add({ "slds-hide": !this.hasSelection() })
      .toString();
  }

  get getListboxClass() {
    const scrollAfterNItems = Number.isInteger(Number(this.scrollAfterNItems))
      ? this.scrollAfterNItems
      : SCROLL_AFTER_N;
    const iconClass = `slds-dropdown_length-with-icon-${scrollAfterNItems}`;
    return classSet("slds-dropdown")
      .add({ [iconClass]: scrollAfterNItems })
      .add("slds-dropdown_fluid")
      .toString();
  }

  get computedLabelClass() {
    return classSet("slds-form-element__label")
      .add({ "slds-assistive-text": this.variant === VARIANTS.LABEL_HIDDEN })
      .toString();
  }

  get isSingleEntry() {
    return !this.isMultiEntry;
  }

  get doneLoading() {
    return !this.isLoading;
  }

  get getSelectIconName() {
    return this.hasSelection() && this.selectedRecords[0].icon?.iconName
      ? this.selectedRecords[0].icon.iconName
      : "standard:default";
  }

  get getInputValue() {
    return this.isMultiEntry || !this.hasSelection()
      ? this.searchTerm
      : this.selectedRecords[0].title;
  }

  get getInputTitle() {
    return this.isMultiEntry || !this.hasSelection()
      ? ""
      : this.selectedRecords[0].title;
  }

  get isInputReadonly() {
    return this.isMultiEntry ? false : this.hasSelection();
  }

  get showClearIcon() {
    if (this.isMultiEntry) {
      return this.searchTerm.length;
    }
    return this.searchTerm.length && !this.hasSelection();
  }

  get showSearchIcon() {
    return !this.showClearIcon;
  }

  get displayHelpMessage() {
    return this.showHelpMessage && this.helpMessage;
  }

  get selectedRecords() {
    const result = [];
    for (const { record, selected } of Array.from(this.records.values())) {
      if (selected) {
        result.push(record);
      }
    }
    return result;
  }

  // event handlers

  handleInput(event) {
    // Prevent action if selection is not allowed
    if (!this.isMultiEntry && this.hasSelection()) {
      return;
    }

    const newSearchTerm = event.target.value;

    this.searchTerm = newSearchTerm;

    // Compare clean new search term with current one and abort if identical

    const newCleanSearchTerm = newSearchTerm
      .trim()
      .replace(REGEX_SOSL_RESERVED, "?");
    if (
      this.cleanSearchTerm?.toLowerCase() === newCleanSearchTerm.toLowerCase()
    ) {
      return;
    }

    // Save clean search term
    this.cleanSearchTerm = newCleanSearchTerm;

    // Ignore search terms that are too small after removing special characters
    if (
      newCleanSearchTerm.replace(/\?/g, "").length < this.minSearchTermLength
    ) {
      this.displayMatching = false;
      this.updateDropdownOfRecords();
      return;
    }

    this.isLoading = true;
    this.displayListBox = false;

    // Apply search throttling (prevents search if user is still typing)
    if (this.searchThrottlingTimeout) {
      clearTimeout(this.searchThrottlingTimeout);
    }
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.searchThrottlingTimeout = setTimeout(async () => {
      // Send search event if search term is long enougth
      if (this.cleanSearchTerm.length >= this.minSearchTermLength) {
        // Display spinner until results are returned

        try {
          if (typeof this.searchHandler === "function") {
            const matching = await Promise.resolve(
              this.searchHandler({
                searchTerm: this.cleanSearchTerm,
                rawSearchTerm: newSearchTerm
              })
            );

            if (matching instanceof Array) {
              const matchingRecords = matching.filter((record) =>
                isNotBlank(record?.id)
              );

              for (const { record } of Array.from(this.records.values())) {
                const match = matchingRecords.find(
                  (recordMatch) => recordMatch.id === record.id
                );
                if (!match) {
                  this.upsertRecord(record.id, {
                    matchesSearchTerm: false
                  });
                }
              }

              matchingRecords.forEach((record) =>
                this.upsertRecord(record.id, {
                  record,
                  matchesSearchTerm: true
                })
              );
            }
          }

          this.displayMatching = true;
          this.displayListBox = true;
        } catch (error) {
          this.setCustomValidity(LABELS.errors.errorFetchingData);
          this.reportValidity();
          this.displayMatching = false;
          this.displayListBox = false;
        } finally {
          this.isLoading = false;
          this.focusedResultIndex = null;
          this.updateDropdownOfRecords();
        }
      }

      this.searchThrottlingTimeout = null;
    }, INPUT_SEARCH_DELAY);
  }

  handleKeyDown(event) {
    if (this.focusedResultIndex === null) {
      this.focusedResultIndex = -1;
    }

    const getFocusableElement = (index) =>
      this.template.querySelector(`[data-index="${[index]}"]`);

    switch (event.keyCode) {
      case KEY_INPUTS.BACKSPACE:
      case KEY_INPUTS.DEL:
        this.handleBackspaceOrDelete();
        break;
      case KEY_INPUTS.ESCAPE:
        this.handleEscape();
        break;
      case KEY_INPUTS.ARROW_DOWN:
        this.handleArrowDown(event, getFocusableElement);
        break;
      case KEY_INPUTS.ARROW_UP:
        this.handleArrowUp(event, getFocusableElement);
        break;
      case KEY_INPUTS.ENTER:
        this.handleEnter(event, getFocusableElement);
        break;
      case KEY_INPUTS.SPACE:
        this.handleSpace(event);
        break;
      default:
        break;
    }
  }

  handleBackspaceOrDelete() {
    if (this.hasSelection() && this.isSingleEntry) {
      this.displayListBox = false;
      this.cancelDisplayListBoxOnFocus = true;
      this.template.querySelector(`[data-id="remove"]`).click();
    }
  }

  handleEscape() {
    this.displayListBox = false;
  }

  handleArrowDown(event, getFocusableElement) {
    this.focusedResultIndex++;
    if (this.focusedResultIndex >= this.recordsDropdown.length) {
      this.focusedResultIndex = 0;
    }

    getFocusableElement(this.focusedResultIndex)?.scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
    event.preventDefault();
  }

  handleArrowUp(event, getFocusableElement) {
    this.focusedResultIndex--;
    if (this.focusedResultIndex < 0) {
      this.focusedResultIndex = this.recordsDropdown.length - 1;
    }
    getFocusableElement(this.focusedResultIndex)?.scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
    event.preventDefault();
  }

  handleEnter(event, getFocusableElement) {
    if (this.hasFocus && this.focusedResultIndex >= 0) {
      if (this.isSingleEntry) {
        if (!this.hasSelection()) {
          getFocusableElement(this.focusedResultIndex)?.click();
          event.preventDefault();
        }
      } else {
        getFocusableElement(this.focusedResultIndex)?.click();
        event.preventDefault();
      }
    }
  }

  handleSpace() {
    if (!this.hasSelection() && isBlank(this.searchTerm)) {
      this.hasFocus = true;
      this.displayListBox = true;
    }
  }

  handleAddSelectedRecord(event) {
    const recordId = event.currentTarget.dataset.recordId;
    this.upsertRecord(recordId, { selected: true });
    this.updateDropdownOfRecords();
    this.processSelectionUpdate(true);
  }

  handleComboboxMouseDown(event) {
    const mainButton = 0;
    if (event.button === mainButton) {
      this.cancelBlur = true;
    }
  }

  handleComboboxMouseUp() {
    this.cancelBlur = false;
    this.focus();
  }

  handleFocus() {
    if (!this.cancelDisplayListBoxOnFocus) {
      this.displayListBox = true;
    } else {
      this.cancelDisplayListBoxOnFocus = false;
    }
    this.hasFocus = true;
    this.focusedResultIndex = null;
    this.updateDropdownOfRecords();
    this.dispatchEvent(new CustomEvent("focus"));
  }

  handleBlur() {
    if (this.cancelBlur) {
      this.cancelBlur = false;
      return;
    }
    this.hasFocus = false;
    this.displayListBox = false;
    this.showHelpMessageIfInvalid();
    this.dispatchEvent(new CustomEvent("blur"));
  }

  handleRemoveSelectedItem(event) {
    if (this.disabled) {
      return;
    }
    this.upsertRecord(event.currentTarget.name, { selected: false });
    this.updateDropdownOfRecords();
    this.processSelectionUpdate(true);

    if (!this.hasSelection()) {
      this.focus();
    }
  }

  handleRemoveSelectionSingleEntry() {
    this.upsertRecord(this.selectedRecords[0].id, { selected: false });
    this.updateDropdownOfRecords();
    this.processSelectionUpdate(true);
    this.focus();
  }

  handleActionClick(event) {
    const name = event.currentTarget.dataset.name;
    this.dispatchEvent(new CustomEvent("action", { detail: name }));
  }

  handleClearSearchTerm() {
    this.cleanSearchTerm = "";
    this.searchTerm = "";
    this.displayMatching = false;
    this.focus();
  }

  // hooks

  async connectedCallback() {
    this.classList.add("slds-form-element");
    this.updateClassList();
    if (!this.hasInit) {
      this.setDefaultRecords();
      await this.setSelection();
      this.updateDropdownOfRecords();
      this.hasInit = true;
      this.isLoading = false;
    }
  }

  async updateValue() {
    await this.setSelection();
    this.updateDropdownOfRecords();
  }

  hasMissingValue() {
    return this.required && !this.disabled && !this.hasSelection();
  }

  hasSelection() {
    return !!this.selectedRecords.length;
  }

  updateDropdownOfRecords() {
    const result = [];
    let regex;
    if (this.displayMatching) {
      const cleanSearchTerm = this.searchTerm
        .replace(REGEX_SOSL_RESERVED, ".?")
        .replace(REGEX_EXTRA_TRAP, "\\$1");
      regex = new RegExp(`(${cleanSearchTerm})`, "gi");
    }

    let index = 0;
    for (const { selected, record, matchesSearchTerm, isDefault } of Array.from(
      this.records.values()
    )) {
      if (selected || !record) {
        continue;
      }

      if (this.displayMatching && matchesSearchTerm) {
        const singleResult = clone(record);
        this.setDisplayableRecord(singleResult, index);
        if (this.highlightTittleOnMatch) {
          this.highlightTitle(singleResult, regex);
        }
        result.push(singleResult);
        index++;
      } else if (!this.displayMatching && isDefault) {
        const singleResult = clone(record);
        this.setDisplayableRecord(singleResult, index);
        result.push(singleResult);
        index++;
      }
    }

    this.recordsDropdown = result;
  }

  highlightTitle(result, regex) {
    result.title =
      this.searchTerm.length >= this.minSearchTermLength &&
      isNotBlank(result.title)
        ? result.title.replace(regex, BOLD_MATCHER_REGEX)
        : result.title;
  }

  processSelectionUpdate(isUserInteraction) {
    if (this.isSingleEntry) {
      this.cleanSearchTerm = "";
      this.searchTerm = "";
    }

    if (this.isSingleEntry && this.hasSelection()) {
      this.displayMatching = false;
      this.displayListBox = false;
    }

    if (isUserInteraction) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            value: this.value,
            info: this.isMultiEntry
              ? this.selectedRecords
              : this.selectedRecords[0]
          }
        })
      );
    }
  }

  setDefaultRecords() {
    if (
      !(this.defaultRecords instanceof Array) ||
      !this.defaultRecords?.length
    ) {
      return;
    }

    for (const record of clone(this.defaultRecords)) {
      if (isNotBlank(record.id)) {
        this.upsertRecord(record.id, {
          record,
          isDefault: true
        });
      }
    }
  }

  async setSelection() {
    try {
      const selectedIds = this.selectedRecords.map((record) => record.id);

      if (typeof this.selectionHandler !== "function" || !selectedIds.length) {
        return;
      }

      const records = await Promise.resolve(
        this.selectionHandler({
          selectedIds
        })
      );

      if (records instanceof Array && records?.length) {
        clone(records).forEach((record) => {
          if (isNotBlank(record.id)) {
            this.upsertRecord(record.id, { record });
          }
        });
      }
    } catch (error) {
      this.setCustomValidity(LABELS.errors.errorFetchingData);
      this.reportValidity();
    }
  }

  upsertRecord(recordId, config = {}) {
    assert(isNotBlank(recordId), "recordId is required");
    const existingRecord = this.records.get(recordId);
    if (existingRecord) {
      Object.assign(this.records.get(recordId), config);
    } else {
      if (!config.record) {
        config.record = { id: recordId, title: recordId };
      }
      this.records.set(recordId, config);
    }
  }

  setDisplayableRecord(record, recordIndex) {
    record.index = recordIndex;
    record.hasSubtitles = !!record.subtitles?.length;
    record.ariaSelected = this.focusedResultIndex === recordIndex;

    if (record.hasSubtitles) {
      record.subtitles.forEach((subtitle, index) => {
        subtitle.index = index;
      });
    }

    // by defining this as a getter it will be updated anytime focusResultIndex changes
    Object.defineProperty(record, "classes", {
      configurable: true,
      get: () => {
        return classSet("slds-media")
          .add("slds-media_center")
          .add("slds-listbox__option")
          .add("slds-listbox__option_entity")
          .add({
            "slds-listbox__option_has-meta": record.hasSubtitles
          })
          .add({ "slds-has-focus": this.focusedResultIndex === recordIndex })
          .toString();
      }
    });

    return record;
  }

  updateClassList() {
    classListMutation(this.classList, {
      "slds-form-element_stacked": this.variant === VARIANTS.LABEL_STACKED,
      "slds-form-element_horizontal": this.variant === VARIANTS.LABEL_INLINE
    });
  }
}

export { KEY_INPUTS, VARIANTS, LABELS, MIN_SEARCH_TERM_LENGTH, SCROLL_AFTER_N };
