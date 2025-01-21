import { LightningElement, api } from "lwc";
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
  KEY_ESCAPE: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ENTER: 13,
  DEL: 46,
  BACKSPACE: 8
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
    invalidHandler: "search handler has to be a function",
    errorFetchingData: "Error Fetching Data"
  }
};

const FORMATTED_TEXT_TYPE = "lightning-formatted-rich-text";

// Minimum required characters for triggering a search
const MIN_SEARCH_TERM_LENGTH = 2;
const SCROLL_AFTER_N = "*";

export default class Lookup extends LightningElement {
  @api actions = [];
  @api disabled = false;
  @api fieldLevelHelp = "";
  @api isMultiEntry = false;
  @api messageWhenValueMissing = LABELS.errors.completeThisField;
  @api placeholder = "";
  @api required = false;

  _defaultOptions = [];
  _minSearchTermLength = MIN_SEARCH_TERM_LENGTH;
  _options = [];
  _value = [];
  _variant = VARIANTS.LABEL_STACKED;
  _label = "";
  _scrollAfterNItems = SCROLL_AFTER_N;

  cancelBlur = false;
  labels = LABELS;
  cleanSearchTerm;
  focusedResultIndex = null;
  hasFocus = false;
  helpMessage;
  loading = false;
  searchResultsLocalState = [];
  searchTerm = "";
  searchThrottlingTimeout;
  showHelpMessage = false;
  displayableOptions = [];
  options = [];
  defaultOptions = [];
  hasInit = false;

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
    assert(isNotBlank(value), LABELS.errors.labelRequired);
    this._label = value;
  }

  @api
  get minSearchTermLength() {
    return this._minSearchTermLength;
  }
  set minSearchTermLength(value) {
    this._minSearchTermLength = Number.isInteger(value)
      ? value
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
    return this.isMultiEntry ? this._value : this._value[0];
  }

  set value(value) {
    if (!this.isMultiEntry) {
      assert(!Array.isArray(value), "value should not be an array");
    }
    if (this.hasInit) {
      this.setSelected(this.getAsArray(value));
    } else {
      this._value = this.getAsArray(value);
    }
  }

  _searchHandler = () => [];

  @api
  get searchHandler() {
    return this._searchHandler;
  }

  set searchHandler(value) {
    assert(typeof value === "function", LABELS.errors.invalidHandler);
    this._searchHandler = value;
  }

  @api
  get validity() {
    return { valid: !this.hasMissingValue && !this.helpMessage };
  }

  @api
  focus() {
    if (this.inputElement?.focus) {
      this.inputElement.focus();
    } else {
      executeAfterRender(() => {
        this.inputElement?.focus();
      });
    }
  }

  @api
  blur() {
    if (this.inputElement?.blur) {
      this.inputElement.blur();
    } else {
      executeAfterRender(() => {
        this.inputElement?.blur();
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

  getAsArray(value) {
    if (Array.isArray(value)) {
      return value;
    } else if (isNotBlank(value)) {
      return [value];
    }

    return [];
  }

  get inputElement() {
    return this.template.querySelector('[data-id="input"');
  }

  get hasSelection() {
    return !!this._value.length;
  }

  get isSingleEntry() {
    return !this.isMultiEntry;
  }

  get isListboxOpen() {
    const isSearchTermValid =
      this.cleanSearchTerm &&
      this.cleanSearchTerm.length >= this.minSearchTermLength;
    return !!(
      this.displayListBox &&
      this.hasFocus &&
      this.isSelectionAllowed &&
      (isSearchTermValid || this.hasResults || this.actions?.length)
    );
  }

  get hasResults() {
    return this.displayableOptions.length;
  }

  get getContainerClass() {
    return classSet("slds-combobox_container")
      .add({ "has-custom-error": this.helpMessage })
      .toString();
  }

  get getDropdownClass() {
    return classSet("slds-combobox")
      .add("slds-dropdown-trigger")
      .add("slds-dropdown-trigger_click")
      .add({ "slds-is-open": this.isListboxOpen })
      .toString();
  }

  get getInputClass() {
    const css = classSet("slds-input")
      .add("slds-combobox__input")
      .add("has-custom-height")
      .add({ "slds-has-focus": this.hasFocus && this.hasResults })
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
    return this.hasSelection && this.selectedOption.icon?.iconName
      ? this.selectedOption.icon.iconName
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
      : this.selectedOption.title;
  }

  get getInputTitle() {
    return this.isMultiEntry || !this.hasSelection
      ? ""
      : this.selectedOption.title;
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

  get emptyItemLabel() {
    return this.loading ? LABELS.loading : LABELS.noResults;
  }

  highlightTitle(result, regex) {
    result.titleFormatted =
      this.searchTerm.length >= this.minSearchTermLength &&
      isNotBlank(result.title)
        ? result.title.replace(regex, BOLD_MATCHER_REGEX)
        : result.title;
  }

  updateSubtitles(result, regex) {
    result.subtitlesFormatted = result.subtitles.map((subtitle, index) => {
      subtitle.index = index;
      subtitle.isLightningIconType = subtitle.type === "lightning-icon";
      subtitle.type = subtitle.type || FORMATTED_TEXT_TYPE;

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

      return subtitle;
    });
  }

  setDisplayableOptions(results) {
    results = Array.isArray(results) ? results : [];
    // Reset the spinner
    this.loading = false;

    const cleanSearchTerm = this.searchTerm
      .replace(REGEX_SOSL_RESERVED, ".?")
      .replace(REGEX_EXTRA_TRAP, "\\$1");
    const regex = new RegExp(`(${cleanSearchTerm})`, "gi");

    // Remove selected items from search results
    this.focusedResultIndex = null;

    this.displayableOptions = clone(results)
      .filter((result) => !this._value.includes(result.id))
      .map((result, index) => {
        this.highlightTitle(result, regex);
        result.hasSubtitles = !!result.subtitles?.length;

        if (result.hasSubtitles) {
          this.updateSubtitles(result, regex);
        }

        result.ariaSelected = this.focusedResultIndex === index;
        // by defining this as a getter it will be updated anytime focusResultIndex changes
        Object.defineProperty(result, "classes", {
          get: () => {
            return classSet("slds-media")
              .add("slds-media_center")
              .add("slds-listbox__option")
              .add("slds-listbox__option_entity")
              .add({
                "slds-listbox__option_has-meta": result.hasSubtitles
              })
              .add({ "slds-has-focus": this.focusedResultIndex === index })
              .toString();
          }
        });
        return result;
      });
  }

  async executeSearch(input) {
    try {
      const options = await Promise.resolve(this.searchHandler(input));
      assert(options instanceof Array);
      return options;
    } catch (error) {
      this.setCustomValidity(LABELS.errors.errorFetchingData);
      this.reportValidity();
    }

    return [];
  }

  updateSearchTerm(newSearchTerm) {
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
      this.setDisplayableOptions(this.defaultOptions);
      return;
    }

    // Apply search throttling (prevents search if user is still typing)
    if (this.searchThrottlingTimeout) {
      clearTimeout(this.searchThrottlingTimeout);
    }
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.searchThrottlingTimeout = setTimeout(async () => {
      // Send search event if search term is long enougth
      if (this.cleanSearchTerm.length >= this.minSearchTermLength) {
        // Display spinner until results are returned
        this.loading = true;

        this.options = await this.executeSearch({
          searchTerm: this.cleanSearchTerm,
          rawSearchTerm: newSearchTerm,
          selectedIds: this._value
        });
        this.setDisplayableOptions(this.options);
      }

      this.searchThrottlingTimeout = null;
    }, SEARCH_DELAY);
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

  get allOptions() {
    const result = new Map();
    const options = [...(this.defaultOptions || []), ...(this.options || [])];

    for (const option of options) {
      if (!result.has(option.id)) {
        result.set(option.id, option);
      }
    }

    return Array.from(result.values());
  }

  get selectedOptions() {
    return this._value
      .map((id) => this.allOptions.find((opt) => opt.id === id))
      .filter(Boolean);
  }

  get selectedOption() {
    return this.selectedOptions[0];
  }

  processSelectionUpdate(isUserInteraction) {
    // Reset search
    this.cleanSearchTerm = "";
    this.searchTerm = "";
    this.setDisplayableOptions(this.defaultOptions);
    // Blur input after single select lookup selection
    if (!this.isMultiEntry && this.hasSelection) {
      this.hasFocus = false;
    }

    // If selection was changed by user, notify parent components
    if (isUserInteraction) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            value: this.value,
            info: this.isMultiEntry ? this.selectedOptions : this.selectedOption
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
    this.updateSearchTerm(event.target.value);
  }

  handleKeyDown(event) {
    if (this.focusedResultIndex === null) {
      this.focusedResultIndex = -1;
    }

    if (
      this.hasSelection &&
      !this.isMultiEntry &&
      (event.keyCode === KEY_INPUTS.BACKSPACE ||
        event.keyCode === KEY_INPUTS.DEL)
    ) {
      this.displayListBox = false;
      this.template.querySelector(`[data-id="remove"]`).click();
    } else if (event.keyCode === KEY_INPUTS.KEY_ESCAPE) {
      this.setDisplayableOptions([]);
    } else if (event.keyCode === KEY_INPUTS.ARROW_DOWN) {
      // If we hit 'down', select the next item, or cycle over.
      this.focusedResultIndex++;
      if (this.focusedResultIndex >= this.allOptions.length) {
        this.focusedResultIndex = 0;
      }
      event.preventDefault();
    } else if (event.keyCode === KEY_INPUTS.ARROW_UP) {
      // If we hit 'up', select the previous item, or cycle over.
      this.focusedResultIndex--;
      if (this.focusedResultIndex < 0) {
        this.focusedResultIndex = this.allOptions.length - 1;
      }
      event.preventDefault();
    } else if (
      event.keyCode === KEY_INPUTS.ENTER &&
      this.hasFocus &&
      this.focusedResultIndex >= 0
    ) {
      // If the user presses enter, and the box is open, and we have used arrows,
      // treat this just like a click on the listbox item
      const { id } = this.displayableOptions[this.focusedResultIndex];
      this.template.querySelector(`[data-item-id="${id}"]`).click();
      event.preventDefault();
    } else if (
      !this.hasSelection &&
      event.keyCode === KEY_INPUTS.ENTER &&
      isBlank(this.searchTerm)
    ) {
      this.hasFocus = true;
      this.displayListBox = true;
    }

    if (
      event.keyCode === KEY_INPUTS.ARROW_DOWN ||
      event.keyCode === KEY_INPUTS.ARROW_UP
    ) {
      const focusedElement = this.template.querySelector(
        `[data-item-id="${this.allOptions[this.focusedResultIndex].id}"]`
      );

      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
  }

  handleResultClick(event) {
    const recordId = event.currentTarget.dataset.itemId;

    this.setSelected([...this._value, recordId]);

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
    this.inputElement.focus();
  }

  handleFocus() {
    this.displayListBox = true;
    this.hasFocus = true;
    this.focusedResultIndex = null;
    this.dispatchEvent(new CustomEvent("focus"));
  }

  handleBlur() {
    if (this.cancelBlur) {
      this.cancelBlur = false;
      return;
    }
    this.hasFocus = false;
    this.showHelpMessageIfInvalid();
    this.dispatchEvent(new CustomEvent("blur"));
  }

  handleRemoveSelectedItem(event) {
    if (this.disabled) {
      return;
    }
    const recordId = event.currentTarget.name;
    this.setSelected(this._value.filter((id) => id !== recordId));
    this.processSelectionUpdate(true);

    if (!this.hasSelection) {
      this.focus();
    }
  }

  setSelected(selectedIds) {
    assert(Array.isArray(selectedIds), "value has to be an array");

    const validSelectedIds = [];

    for (const id of [...new Set(selectedIds)]) {
      assert(isNotBlank(id), "Id cannot be invalid");
      const option = this.allOptions.find((opt) => opt.id === id);
      if (option) {
        validSelectedIds.push(id);
      }
    }

    this._value = validSelectedIds;
  }

  handleClearSelection() {
    this.setSelected([]);
    // this.hasFocus = false;
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
      this.init();
    }
  }

  async init() {
    assert(isNotBlank(this.label), LABELS.errors.labelRequired);
    assert(
      typeof this.searchHandler === "function",
      LABELS.errors.invalidHandler
    );

    this.defaultOptions = await this.executeSearch({ getDefault: true });
    this.setDisplayableOptions(this.defaultOptions);

    if (this._value.length) {
      this.options = await this.executeSearch({
        getInitialSelection: true,
        selectedIds: this._value
      });
      this.setSelected(this._value);
    }

    this.hasInit = true;
  }

  updateClassList() {
    classListMutation(this.classList, {
      "slds-form-element_stacked": this.variant === VARIANTS.LABEL_STACKED,
      "slds-form-element_horizontal": this.variant === VARIANTS.LABEL_INLINE
    });
  }
}

export { KEY_INPUTS, VARIANTS, LABELS, MIN_SEARCH_TERM_LENGTH, SCROLL_AFTER_N };
