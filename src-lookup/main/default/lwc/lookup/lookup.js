import { LightningElement, api } from "lwc";

const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

const KEY_ARROW_UP = 38;
const KEY_ARROW_DOWN = 40;
const KEY_ENTER = 13;

const VARIANT_LABEL_STACKED = "label-stacked";
const VARIANT_LABEL_INLINE = "label-inline";
const VARIANT_LABEL_HIDDEN = "label-hidden";
const MATCHER_REGEX = "<strong>$1</strong>";

const REGEX_SOSL_RESERVED =
  /(\?|&|\||!|\{|\}|\[|\]|\(|\)|\^|~|\*|:|"|\+|-|\\)/g;
const REGEX_EXTRA_TRAP = /(\$|\\)/g;

export default class Lookup extends LightningElement {
  // Public properties
  @api disabled = false;
  @api helpText = "";
  @api isMultiEntry = false;
  @api label = "";
  @api minSearchTermLength = 2;
  @api placeholder = "";
  @api required = false;
  @api scrollAfterNItems = "*";
  @api variant = VARIANT_LABEL_STACKED;

  // Template properties
  loading = false;
  searchResultsLocalState = [];
  _actions = [];
  _errors = [];

  // Private properties
  _cancelBlur = false;
  _cleanSearchTerm;
  _curSelection = [];
  _defaultSearchResults = [];
  _focusedResultIndex = null;
  _hasFocus = false;
  _isDirty = false;
  _searchResults = [];
  _searchTerm = "";
  _searchThrottlingTimeout;

  // PUBLIC FUNCTIONS AND GETTERS/SETTERS

  @api
  get actions() {
    return this._actions;
  }

  set actions(value) {
    if (Array.isArray(value)) {
      this._actions = JSON.parse(JSON.stringify(value)).map((singleValue) => {
        if (!singleValue.icon) {
          singleValue.icon = "utility:add";
        }
        return singleValue;
      });
    }
  }

  @api
  get value() {
    return this._curSelection;
  }

  set value(value) {
    if (value) {
      this._curSelection = Array.isArray(value) ? value : [value];
      this.processSelectionUpdate(false);
    }
  }

  @api
  get errors() {
    return this._errors;
  }

  set errors(errors) {
    this._errors = errors;
    // Blur component if errors are passed
    if (this._errors?.length) {
      this.blur();
    }
  }

  @api
  get validity() {
    return { valid: !this._errors?.length };
  }

  @api
  get searchResults() {
    return this._searchResults;
  }

  set searchResults(value) {
    if (Array.isArray(value)) {
      this.setSearchResults(value);
    }
  }

  @api
  get defaultSearchResults() {
    return this._defaultSearchResults;
  }

  set defaultSearchResults(value) {
    if (Array.isArray(value)) {
      this.setDefaultResults(value);
    }
  }

  @api
  setSearchResults(results) {
    // Reset the spinner
    this.loading = false;
    // Remove selected items from search results
    const selectedIds = this._curSelection.map((sel) => sel.id);
    // Clone results before modifying them to avoid Locker restriction
    const resultsLocal = JSON.parse(JSON.stringify(results)).filter(
      ({ id }) => !selectedIds.includes(id)
    );
    // Format results
    const cleanSearchTerm = this._searchTerm
      .replace(REGEX_SOSL_RESERVED, ".?")
      .replace(REGEX_EXTRA_TRAP, "\\$1");
    const regex = new RegExp(`(${cleanSearchTerm})`, "gi");
    this._searchResults = resultsLocal.map((result) => {
      // Format title and subtitles
      if (this._searchTerm.length) {
        result.titleFormatted = result.title
          ? result.title.replace(regex, MATCHER_REGEX)
          : result.title;

        if (result.subtitles?.length) {
          result.hasSubtitles = true;
          result.subtitlesFormatted = result.subtitles.map(
            (subtitle, index) => {
              subtitle.index = index;
              subtitle.value =
                subtitle.value && subtitle.highlightSearchTerm
                  ? subtitle.value.replace(regex, MATCHER_REGEX)
                  : subtitle.value;
              return subtitle;
            }
          );
        }

        result.subtitleFormatted = result.subtitle
          ? result.subtitle.replace(regex, MATCHER_REGEX)
          : result.subtitle;
      } else {
        result.titleFormatted = result.title;
        result.subtitleFormatted = result.subtitle;

        if (result.subtitles?.length) {
          result.hasSubtitles = true;
          result.subtitlesFormatted = result.subtitles.map(
            (subtitle, index) => {
              subtitle.index = index;
              return subtitle;
            }
          );
        }
      }

      // Add icon if missing
      result.icon = result.icon || "standard:default";

      return result;
    });
    // Add local state and dynamic class to search results
    this._focusedResultIndex = null;
    const self = this;
    this.searchResultsLocalState = this._searchResults.map((result, i) => {
      return {
        result,
        state: {},
        get classes() {
          return [
            "slds-media",
            "slds-media_center",
            "slds-listbox__option",
            "slds-listbox__option_entity",
            ...(result.subtitlesFormatted?.length
              ? ["slds-listbox__option_has-meta"]
              : []),
            ...(self._focusedResultIndex === i ? ["slds-has-focus"] : [])
          ].join(" ");
        }
      };
    });
  }

  @api
  setDefaultResults(results) {
    this._defaultSearchResults = [...results];
    if (!this._searchResults.length) {
      this.setSearchResults(this._defaultSearchResults);
    }
  }

  @api
  focus() {
    this.template.querySelector("input")?.focus();
  }

  @api
  blur() {
    this.template.querySelector("input")?.blur();
  }

  // INTERNAL FUNCTIONS

  updateSearchTerm(newSearchTerm) {
    this._searchTerm = newSearchTerm;

    // Compare clean new search term with current one and abort if identical
    const newCleanSearchTerm = newSearchTerm
      .trim()
      .replace(REGEX_SOSL_RESERVED, "?")
      .toLowerCase();
    if (this._cleanSearchTerm === newCleanSearchTerm) {
      return;
    }

    // Save clean search term
    this._cleanSearchTerm = newCleanSearchTerm;

    // Ignore search terms that are too small after removing special characters
    if (
      newCleanSearchTerm.replace(/\?/g, "").length < this.minSearchTermLength
    ) {
      this.setSearchResults(this._defaultSearchResults);
      return;
    }

    // Apply search throttling (prevents search if user is still typing)
    if (this._searchThrottlingTimeout) {
      clearTimeout(this._searchThrottlingTimeout);
    }
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this._searchThrottlingTimeout = setTimeout(() => {
      // Send search event if search term is long enougth
      if (this._cleanSearchTerm.length >= this.minSearchTermLength) {
        // Display spinner until results are returned
        this.loading = true;

        this.dispatchEvent(
          new CustomEvent("search", {
            detail: {
              searchTerm: this._cleanSearchTerm,
              rawSearchTerm: newSearchTerm,
              selectedIds: this._curSelection.map(({ id }) => id)
            }
          })
        );
      }
      this._searchThrottlingTimeout = null;
    }, SEARCH_DELAY);
  }

  isSelectionAllowed() {
    return this.isMultiEntry || !this.hasSelection();
  }

  hasSelection() {
    return this._curSelection.length;
  }

  processSelectionUpdate(isUserInteraction) {
    // Reset search
    this._cleanSearchTerm = "";
    this._searchTerm = "";
    this.setSearchResults([...this._defaultSearchResults]);
    // Indicate that component was interacted with
    this._isDirty = isUserInteraction;
    // Blur input after single select lookup selection
    if (!this.isMultiEntry && this.hasSelection()) {
      this._hasFocus = false;
    }
    // If selection was changed by user, notify parent components
    if (isUserInteraction) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: this._curSelection.map(({ id }) => id)
        })
      );
    }
  }

  // EVENT HANDLING

  handleInput(event) {
    // Prevent action if selection is not allowed
    if (!this.isSelectionAllowed()) {
      return;
    }
    this.updateSearchTerm(event.target.value);
  }

  handleKeyDown(event) {
    if (this._focusedResultIndex === null) {
      this._focusedResultIndex = -1;
    }
    if (event.keyCode === KEY_ARROW_DOWN) {
      // If we hit 'down', select the next item, or cycle over.
      this._focusedResultIndex++;
      if (this._focusedResultIndex >= this._searchResults.length) {
        this._focusedResultIndex = 0;
      }
      event.preventDefault();
    } else if (event.keyCode === KEY_ARROW_UP) {
      // If we hit 'up', select the previous item, or cycle over.
      this._focusedResultIndex--;
      if (this._focusedResultIndex < 0) {
        this._focusedResultIndex = this._searchResults.length - 1;
      }
      event.preventDefault();
    } else if (
      event.keyCode === KEY_ENTER &&
      this._hasFocus &&
      this._focusedResultIndex >= 0
    ) {
      // If the user presses enter, and the box is open, and we have used arrows,
      // treat this just like a click on the listbox item
      const { id } = this._searchResults[this._focusedResultIndex];
      this.template.querySelector(`[data-recordid="${id}"]`).click();
      event.preventDefault();
    }
  }

  handleResultClick(event) {
    const recordId = event.currentTarget.dataset.recordid;

    // Save selection
    const selectedItem = this._searchResults.find(({ id }) => id === recordId);

    if (!selectedItem) {
      return;
    }
    this._curSelection = [...this._curSelection, selectedItem];

    // Process selection update
    this.processSelectionUpdate(true);
  }

  handleComboboxMouseDown(event) {
    const mainButton = 0;
    if (event.button === mainButton) {
      this._cancelBlur = true;
    }
  }

  handleComboboxMouseUp() {
    this._cancelBlur = false;
    // Re-focus to text input for the next blur event
    this.template.querySelector("input").focus();
  }

  handleFocus() {
    // Prevent action if selection is not allowed
    if (!this.isSelectionAllowed()) {
      return;
    }
    this._hasFocus = true;
    this._focusedResultIndex = null;
  }

  handleBlur() {
    // Prevent action if selection is either not allowed or cancelled
    if (!this.isSelectionAllowed() || this._cancelBlur) {
      return;
    }
    this._hasFocus = false;
  }

  handleRemoveSelectedItem(event) {
    if (this.disabled) {
      return;
    }
    const recordId = event.currentTarget.name;
    this._curSelection = this._curSelection.filter(({ id }) => id !== recordId);
    // Process selection update
    this.processSelectionUpdate(true);
  }

  handleClearSelection() {
    this._curSelection = [];
    this._hasFocus = false;
    // Process selection update
    this.processSelectionUpdate(true);
  }

  handleNewRecordClick(event) {
    const actionName = event.currentTarget.dataset.name;
    this.dispatchEvent(new CustomEvent("action", { detail: actionName }));
  }

  // STYLE EXPRESSIONS

  get isSingleEntry() {
    return !this.isMultiEntry;
  }

  get isListboxOpen() {
    const isSearchTermValid =
      this._cleanSearchTerm &&
      this._cleanSearchTerm.length >= this.minSearchTermLength;
    return (
      this._hasFocus &&
      this.isSelectionAllowed() &&
      (isSearchTermValid || this.hasResults || this._actions?.length)
    );
  }

  get hasResults() {
    return this._searchResults.length;
  }

  get getFormElementClass() {
    return this.variant === VARIANT_LABEL_INLINE
      ? "slds-form-element slds-form-element_horizontal"
      : "slds-form-element";
  }

  get getLabelClass() {
    return this.variant === VARIANT_LABEL_HIDDEN
      ? "slds-form-element__label slds-assistive-text"
      : "slds-form-element__label";
  }

  get getContainerClass() {
    return !this._errors.length
      ? "slds-combobox_container"
      : "slds-combobox_container has-custom-error";
  }

  get getDropdownClass() {
    return [
      "slds-combobox",
      "slds-dropdown-trigger",
      "slds-dropdown-trigger_click",
      ...(this.isListboxOpen ? ["slds-is-open"] : [])
    ].join(" ");
  }

  get getInputClass() {
    const hasCustomError =
      this._errors.length ||
      (this._isDirty && this.required && !this.hasSelection());
    const setFocus = this._hasFocus && this.hasResults;
    const css = [
      "slds-input",
      "slds-combobox__input",
      "has-custom-height",
      ...(setFocus ? ["slds-has-focus"] : []),
      ...(hasCustomError ? ["has-custom-error"] : [])
    ];

    if (!this.isMultiEntry) {
      css.push(
        ...[
          "slds-combobox__input-value",
          ...(this.hasSelection() ? ["has-custom-border"] : [])
        ]
      );
    }
    return css.join(" ");
  }

  get getComboboxClass() {
    return [
      "slds-combobox__form-element",
      "slds-input-has-icon",
      ...(this.isMultiEntry || !this.hasSelection()
        ? ["slds-input-has-icon_right"]
        : ["slds-input-has-icon_left-right"])
    ].join(" ");
  }

  get getSearchIconClass() {
    return [
      "slds-input__icon",
      "slds-input__icon_right",
      ...(!this.isMultiEntry && this.hasSelection() ? ["slds-hide"] : [])
    ].join(" ");
  }

  get getClearSelectionButtonClass() {
    return [
      "slds-button",
      "slds-button_icon",
      "slds-input__icon",
      "slds-input__icon_right",
      ...(!this.hasSelection() ? ["slds-hide"] : [])
    ].join(" ");
  }

  get getSelectIconName() {
    return this.hasSelection()
      ? this._curSelection[0].icon
      : "standard:default";
  }

  get getSelectIconClass() {
    return (
      "slds-combobox__input-entity-icon " +
      (this.hasSelection() ? "" : "slds-hide")
    );
  }

  get getInputValue() {
    return this.isMultiEntry || !this.hasSelection()
      ? this._searchTerm
      : this._curSelection[0].title;
  }

  get getInputTitle() {
    return this.isMultiEntry || !this.hasSelection()
      ? ""
      : this._curSelection[0].title;
  }

  get getListboxClass() {
    return (
      "slds-dropdown " +
      (this.scrollAfterNItems
        ? `slds-dropdown_length-with-icon-${this.scrollAfterNItems} `
        : "") +
      "slds-dropdown_fluid"
    );
  }

  get isInputReadonly() {
    return this.isMultiEntry ? false : this.hasSelection();
  }
}
