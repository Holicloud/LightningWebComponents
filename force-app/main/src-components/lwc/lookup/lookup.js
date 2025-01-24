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

// Delay for search execution after user input (in milliseconds)
const SEARCH_DELAY = 300;

// Key codes for input handling
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
  LABEL_STACKED: "label-stacked", // Label above the input
  LABEL_INLINE: "label-inline", // Label next to the input
  LABEL_HIDDEN: "label-hidden" // Label hidden from view
};

// Regex for filtering out special SOSL characters
const REGEX_SOSL_RESERVED =
  /(\?|&|\||!|\{|\}|\[|\]|\(|\)|\^|~|\*|:|"|\+|-|\\)/g;
const REGEX_EXTRA_TRAP = /(\$|\\)/g;

// Default labels for component states
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

const FORMATTED_TEXT_TYPE = "lightning-formatted-rich-text";

// Minimum required characters for triggering a search
const MIN_SEARCH_TERM_LENGTH = 2;
const SCROLL_AFTER_N = "*";

const SUBTITLE_TYPES = {
  ICON: "lightning-icon"
};

const DEFAULT_LABEL = "Select";

export default class Lookup extends LightningElement {
  @api actions = [];
  @api disabled = false;
  @api fieldLevelHelp = "";
  @api isMultiEntry = false;
  @api messageWhenValueMissing = LABELS.errors.completeThisField;
  @api placeholder = "";
  @api required = false;

  _defaultRecords = [];
  _label = DEFAULT_LABEL;
  _minSearchTermLength = MIN_SEARCH_TERM_LENGTH;
  _scrollAfterNItems = SCROLL_AFTER_N;
  _variant = VARIANTS.LABEL_STACKED;

  @track recordsDropdown = [];
  isLoading = true;
  records = new Map();
  cancelBlur = false;
  cleanSearchTerm;
  displayListBox = false;
  displayMatching = false;
  focusedResultIndex = null;
  hasFocus = false;
  hasInit = false;
  helpMessage;
  labels = LABELS;
  searchTerm = "";
  searchThrottlingTimeout;
  showHelpMessage = false;

  @api
  get scrollAfterNItems() {
    return this._scrollAfterNItems;
  }
  set scrollAfterNItems(value) {
    this._scrollAfterNItems =
      value === "*" || Number.isInteger(value) ? value : SCROLL_AFTER_N;
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
    this._minSearchTermLength = Number.isInteger(value)
      ? value < MIN_SEARCH_TERM_LENGTH
        ? MIN_SEARCH_TERM_LENGTH
        : value
      : MIN_SEARCH_TERM_LENGTH;
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
      : this.selectedRecord?.id;
  }

  set value(value) {
    let selectedIds = [];

    if (!this.isMultiEntry) {
      selectedIds.push(value);
    } else if (value instanceof Array && value.length) {
      selectedIds = value;
    }

    selectedIds = selectedIds.filter(
      (recordId) => typeof recordId === "string" && isNotBlank(recordId)
    );

    selectedIds.forEach((recordId) => {
      this.upsertRecord(recordId, {
        selected: true
      });
    });

    if (selectedIds.length) {
      this.setValue(selectedIds);
    }
  }

  _searchHandler = () => [];

  @api
  get searchHandler() {
    return this._searchHandler;
  }

  set searchHandler(value) {
    this._searchHandler = typeof value === "function" ? value : () => [];
  }

  _selectionHandler = () => [];

  @api
  get selectionHandler() {
    return this._selectionHandler;
  }

  set selectionHandler(value) {
    this._selectionHandler = typeof value === "function" ? value : () => [];
  }

  @api
  get validity() {
    return { valid: !this.hasMissingValue && !this.helpMessage };
  }

  @api
  get defaultRecords() {
    return this._defaultRecords;
  }
  set defaultRecords(value) {
    this._defaultRecords = value instanceof Array ? value : [];

    for (const { isDefault, record } of Array.from(this.records.values())) {
      if (isDefault) {
        const isNowDefaulted = this._defaultRecords.find(
          (defaultRecord) => defaultRecord.id === record.id
        );

        if (!isNowDefaulted) {
          this.upsertRecord(record.id, {
            isDefault: false
          });
        }
      }
    }

    for (const record of this._defaultRecords) {
      this.upsertRecord(record.id, {
        record,
        isDefault: true
      });
    }
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
    if (this.hasMissingValue) {
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

  get hasSelection() {
    return !!this.selectedRecords.length;
  }

  get isSingleEntry() {
    return !this.isMultiEntry;
  }

  get doneLoading() {
    return !this.isLoading;
  }

  get getContainerClass() {
    return classSet("slds-combobox_container")
      .add({ "has-custom-error": this.helpMessage })
      .toString();
  }

  get getDropdownClass() {
    const isSearchTermValid =
      this.cleanSearchTerm?.length >= this.minSearchTermLength;
    const openListOfRecords = !!(
      this.displayListBox &&
      this.isSelectionAllowed &&
      (isSearchTermValid ||
        this.recordsDropdown?.length ||
        this.actions?.length)
    );

    return classSet("slds-combobox")
      .add("slds-dropdown-trigger")
      .add("slds-dropdown-trigger_click")
      .add({ "slds-is-open": openListOfRecords })
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

    if (!this.isMultiEntry) {
      css.add("slds-combobox__input-value");
      css.add({ "has-custom-border": this.hasSelection });
    }

    return css.toString();
  }

  get getComboboxClass() {
    const iconClass =
      this.isMultiEntry || !this.hasSelection
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
      .add({ "slds-hide": !this.isMultiEntry && this.hasSelection })
      .toString();
  }

  get getClearSelectionButtonClass() {
    return classSet("slds-button")
      .add("slds-button_icon")
      .add("slds-input__icon")
      .add("slds-input__icon_right")
      .add({ "slds-hide": !this.hasSelection })
      .toString();
  }

  get getSelectIconName() {
    return this.hasSelection && this.selectedRecord.icon?.iconName
      ? this.selectedRecord.icon.iconName
      : "standard:default";
  }

  get getSelectIconClass() {
    return classSet("slds-combobox__input-entity-icon")
      .add({ "slds-hide": !this.hasSelection })
      .toString();
  }

  get getInputValue() {
    return this.isMultiEntry || !this.hasSelection
      ? this.searchTerm
      : this.selectedRecord.title;
  }

  get getInputTitle() {
    return this.isMultiEntry || !this.hasSelection
      ? ""
      : this.selectedRecord.title;
  }

  get getListboxClass() {
    const iconClass = `slds-dropdown_length-with-icon-${this.scrollAfterNItems}`;
    return classSet("slds-dropdown")
      .add({ [iconClass]: this.scrollAfterNItems })
      .add("slds-dropdown_fluid")
      .toString();
  }

  get isInputReadonly() {
    return this.isMultiEntry ? false : this.hasSelection;
  }

  get showClearIcon() {
    if (this.isMultiEntry) {
      return this.searchTerm.length;
    }
    return this.searchTerm.length && !this.hasSelection;
  }

  get showSearchIcon() {
    return !this.showClearIcon;
  }

  get isSelectionAllowed() {
    return this.isMultiEntry || !this.hasSelection;
  }

  get displayHelpMessage() {
    return this.showHelpMessage && this.helpMessage;
  }

  get computedLabelClass() {
    return classSet("slds-form-element__label")
      .add({ "slds-assistive-text": this.variant === VARIANTS.LABEL_HIDDEN })
      .toString();
  }

  get hasMissingValue() {
    return this.required && !this.disabled && !this.hasSelection;
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
        this.highlightTitle(singleResult, regex);

        if (singleResult.hasSubtitles) {
          this.updateSubtitles(singleResult, regex);
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

  get selectedRecords() {
    const result = [];
    for (const { record, selected } of Array.from(this.records.values())) {
      if (selected) {
        result.push(record);
      }
    }
    return result;
  }

  get selectedRecord() {
    return this.selectedRecords[0];
  }

  get fetchedIds() {
    return Array.from(this.records.values())
      .filter((record) => record.fetched)
      .map((record) => record.id);
  }

  highlightTitle(result, regex) {
    result.title =
      this.searchTerm.length >= this.minSearchTermLength &&
      isNotBlank(result.title)
        ? result.title.replace(regex, BOLD_MATCHER_REGEX)
        : result.title;
  }

  updateSubtitles(result, regex) {
    result.subtitles.forEach((subtitle) => {
      if (
        this.searchTerm.length >= this.minSearchTermLength &&
        subtitle.highlightSearchTerm &&
        subtitle.type === FORMATTED_TEXT_TYPE
      ) {
        const formattedSubtitle = String(subtitle.value);
        subtitle.value = isNotBlank(formattedSubtitle)
          ? formattedSubtitle.replace(regex, BOLD_MATCHER_REGEX)
          : formattedSubtitle;
      }
    });
  }

  async executeSearch(input) {
    try {
      const options = await Promise.resolve(this.searchHandler(input));
      assert(options instanceof Array);
      return clone(options).filter(
        (record) => typeof record?.id === "string" && isNotBlank(record.id)
      );
    } catch (error) {
      this.setCustomValidity(LABELS.errors.errorFetchingData);
      this.reportValidity();
    }

    return [];
  }

  async executeGetSelectionHandler(input) {
    try {
      const options = await Promise.resolve(this.selectionHandler(input));
      assert(options instanceof Array);
      return clone(options).filter(
        (record) => typeof record?.id === "string" && isNotBlank(record.id)
      );
    } catch (error) {
      this.setCustomValidity(LABELS.errors.errorFetchingData);
      this.reportValidity();
    }

    return [];
  }

  handleClearSearchTerm() {
    this.cleanSearchTerm = "";
    this.searchTerm = "";
    this.displayMatching = false;
    this.focus();
  }

  processSelectionUpdate(isUserInteraction) {
    // Reset search
    this.cleanSearchTerm = "";
    this.searchTerm = "";
    if (!this.isMultiEntry && this.hasSelection) {
      this.displayMatching = false;
      this.displayListBox = false;
    }

    // If selection was changed by user, notify parent components
    if (isUserInteraction) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            value: this.value,
            info: this.isMultiEntry ? this.selectedRecords : this.selectedRecord
          }
        })
      );
    }
  }

  // EVENT HANDLING

  handleInput(event) {
    // Prevent action if selection is not allowed
    if (!this.isSelectionAllowed) {
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

        const matchingRecords = await this.executeSearch({
          searchTerm: this.cleanSearchTerm,
          rawSearchTerm: newSearchTerm,
          fetchedIds: this.fetchedIds
        });

        // update matching
        const matchingRecordIds = matchingRecords.map((record) => record.id);

        for (const { record } of Array.from(this.records.values())) {
          if (!matchingRecordIds.includes(record.id)) {
            this.upsertRecord(record.id, { matchesSearchTerm: false });
          }
        }

        matchingRecords.forEach((record) =>
          this.upsertRecord(record.id, {
            record,
            matchesSearchTerm: true,
            fetched: true
          })
        );
        this.displayMatching = true;
        this.isLoading = false;
        this.displayListBox = true;
        this.focusedResultIndex = null;
        this.updateDropdownOfRecords();
      }

      this.searchThrottlingTimeout = null;
    }, SEARCH_DELAY);
  }

  handleKeyDown(event) {
    if (this.focusedResultIndex === null) {
      this.focusedResultIndex = -1;
    }

    const getFocusableElement = (index) =>
      this.template.querySelector(`[data-index="${[index]}"]`);

    if (
      this.hasSelection &&
      !this.isMultiEntry &&
      (event.keyCode === KEY_INPUTS.BACKSPACE ||
        event.keyCode === KEY_INPUTS.DEL)
    ) {
      this.displayListBox = false;
      this.cancelDisplayListBoxOnFocus = true;
      this.template.querySelector(`[data-id="remove"]`).click();
    } else if (event.keyCode === KEY_INPUTS.ESCAPE) {
      this.displayListBox = false;
    } else if (event.keyCode === KEY_INPUTS.ARROW_DOWN) {
      // If we hit 'down', select the next item, or cycle over.
      this.focusedResultIndex++;
      if (this.focusedResultIndex >= this.recordsDropdown.length) {
        this.focusedResultIndex = 0;
      }

      getFocusableElement(this.focusedResultIndex)?.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
      event.preventDefault();
    } else if (event.keyCode === KEY_INPUTS.ARROW_UP) {
      // If we hit 'up', select the previous item, or cycle over.
      this.focusedResultIndex--;
      if (this.focusedResultIndex < 0) {
        this.focusedResultIndex = this.recordsDropdown.length - 1;
      }
      getFocusableElement(this.focusedResultIndex)?.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
      event.preventDefault();
    } else if (
      event.keyCode === KEY_INPUTS.ENTER &&
      this.hasFocus &&
      this.focusedResultIndex >= 0
    ) {
      if (!this.isMultiEntry) {
        if (!this.hasSelection) {
          getFocusableElement(this.focusedResultIndex)?.click();
          event.preventDefault();
        }
      } else {
        getFocusableElement(this.focusedResultIndex)?.click();
        event.preventDefault();
      }
    } else if (
      !this.hasSelection &&
      (event.keyCode === KEY_INPUTS.ENTER ||
        event.keyCode === KEY_INPUTS.SPACE) &&
      isBlank(this.searchTerm)
    ) {
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

    if (!this.hasSelection) {
      this.focus();
    }
  }

  handleRemoveSelectionSingleEntry() {
    this.upsertRecord(this.selectedRecord.id, { selected: false });
    this.updateDropdownOfRecords();
    this.processSelectionUpdate(true);
    this.focus();
  }

  handleActionClick(event) {
    const name = event.currentTarget.dataset.name;
    this.dispatchEvent(new CustomEvent("action", { detail: name }));
  }

  connectedCallback() {
    this.classList.add("slds-form-element");
    this.updateClassList();
    if (!this.hasInit) {
      this.updateDropdownOfRecords();
      this.hasInit = true;
      this.isLoading = false;
    }
  }

  async setValue(selectedIds) {
    const selectedRecords = await this.executeGetSelectionHandler({
      selectedIds
    });

    selectedRecords.forEach((record) => {
      this.upsertRecord(record.id, { record });
    });

    if (this.hasInit) {
      this.updateDropdownOfRecords();
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
        subtitle.isLightningIconType = subtitle.type === SUBTITLE_TYPES.ICON;
        subtitle.type = subtitle.type || FORMATTED_TEXT_TYPE;
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
