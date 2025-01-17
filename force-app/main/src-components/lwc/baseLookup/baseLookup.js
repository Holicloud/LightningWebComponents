import { LightningElement, api } from "lwc";
import {
  classSet,
  classListMutation,
  clone,
  Assert,
  isNotBlank
} from "c/utils";

// Delay for search execution after user input (in milliseconds)
const SEARCH_DELAY = 300;

// Key codes for input handling
const KEY_INPUTS = {
  KEY_ESCAPE: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ENTER: 13
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
  loading: "Loading..."
};

const FORMATTED_TEXT_TYPE = "lightning-formatted-rich-text";

// Minimum required characters for triggering a search
const MIN_SEARCH_TERM_LENGTH = 2;

export default class BaseLookup extends LightningElement {
  @api disabled = false;
  @api fieldLevelText = "";
  @api isMultiEntry = false;
  @api label = "";
  @api placeholder = "";
  @api required = false;
  @api scrollAfterNItems = "*";
  @api messageWhenValueMissing = "Complete this field.";
  @api actions = [];

  loading = false;
  searchTerm = "";
  searchThrottlingTimeout;
  searchResultsLocalState = [];
  helpMessage;
  cancelBlur = false;
  cleanSearchTerm;
  focusedResultIndex = null;
  showHelpMessage = false;
  hasFocus = false;

  _variant = VARIANTS.LABEL_STACKED;
  _value = [];
  _defaultSearchResults = [];
  _minSearchTermLength = MIN_SEARCH_TERM_LENGTH;
  _searchResults = [];

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
    return this._value;
  }

  set value(value) {
    this.setValue(value);
    this.processSelectionUpdate(false);
  }

  @api
  get validity() {
    return { valid: !this.hasMissingValue && !this.helpMessage };
  }

  @api
  get searchResults() {
    return this._searchResults;
  }

  set searchResults(value) {
    this.setSearchResults(Array.isArray(value) ? value : []);
  }

  @api
  get defaultSearchResults() {
    return this._defaultSearchResults;
  }

  set defaultSearchResults(value) {
    const results = clone(value);
    this.setSearchResults(results);
    this._defaultSearchResults = results;
  }

  get inputElement() {
    return this.template.querySelector('[data-id="input"');
  }

  @api
  focus() {
    if (this.inputElement?.focus) {
      this.inputElement.focus();
    } else {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        this.inputElement?.focus();
      }, 0);
    }
  }

  @api
  blur() {
    if (this.inputElement?.blur) {
      this.inputElement.blur();
    } else {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        this.inputElement?.blur();
      }, 0);
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
    this.blur();
  }

  @api
  showHelpMessageIfInvalid() {
    this.reportValidity();
  }

  get hasSelection() {
    return this.value.length;
  }

  get isSingleEntry() {
    return !this.isMultiEntry;
  }

  get isListboxOpen() {
    const isSearchTermValid =
      this.cleanSearchTerm &&
      this.cleanSearchTerm.length >= this.minSearchTermLength;
    return (
      this.hasFocus &&
      this.isSelectionAllowed &&
      (isSearchTermValid || this.hasResults || this.actions?.length)
    );
  }

  get hasResults() {
    return this.searchResults.length;
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
    return this.hasSelection && this.value[0].icon?.iconName
      ? this.value[0].icon.iconName
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
      : this.value[0].title;
  }

  get getInputTitle() {
    return this.isMultiEntry || !this.hasSelection ? "" : this.value[0].title;
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

  updateTitle(result, regex) {
    result.titleFormatted =
      this.searchTerm.length && isNotBlank(result.title)
        ? result.title.replace(regex, BOLD_MATCHER_REGEX)
        : result.title;
  }

  updateSubtitles(result, regex) {
    result.subtitlesFormatted = result.subtitles.map((subtitle, index) => {
      subtitle.index = index;
      subtitle.isLightningIconType = subtitle.type === "lightning-icon";
      subtitle.type = subtitle.type || FORMATTED_TEXT_TYPE;

      if (
        this.searchTerm.length &&
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

  setSearchResults(results) {
    // Reset the spinner
    this.loading = false;
    Assert.isArray(results);

    const cleanSearchTerm = this.searchTerm
      .replace(REGEX_SOSL_RESERVED, ".?")
      .replace(REGEX_EXTRA_TRAP, "\\$1");
    const regex = new RegExp(`(${cleanSearchTerm})`, "gi");

    // Remove selected items from search results
    const selectedIds = this.value.map((sel) => sel.id);

    this._searchResults = clone(results)
      .filter((result) => !selectedIds.includes(result.id))
      .map((result, index) => {
        this.updateTitle(result, regex);
        result.hasSubtitles = !!result.subtitles?.length;

        if (result.hasSubtitles) {
          this.updateSubtitles(result, regex);
        }

        result.classes = classSet("slds-media")
          .add("slds-media_center")
          .add("slds-listbox__option")
          .add("slds-listbox__option_entity")
          .add({
            "slds-listbox__option_has-meta": result.hasSubtitles
          })
          .add({ "slds-has-focus": this.focusedResultIndex === index })
          .toString();
        return result;
      });
  }

  updateSearchTerm(newSearchTerm) {
    this.searchTerm = newSearchTerm;

    // Compare clean new search term with current one and abort if identical

    const newCleanSearchTerm = newSearchTerm
      .trim()
      .replace(REGEX_SOSL_RESERVED, "?")
      .toLowerCase();
    if (this.cleanSearchTerm === newCleanSearchTerm) {
      return;
    }

    // Save clean search term
    this.cleanSearchTerm = newCleanSearchTerm;

    // Ignore search terms that are too small after removing special characters
    if (
      newCleanSearchTerm.replace(/\?/g, "").length < this.minSearchTermLength
    ) {
      this.setSearchResults(this.defaultSearchResults);
      return;
    }

    // Apply search throttling (prevents search if user is still typing)
    if (this.searchThrottlingTimeout) {
      clearTimeout(this.searchThrottlingTimeout);
    }
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.searchThrottlingTimeout = setTimeout(() => {
      // Send search event if search term is long enougth
      if (this.cleanSearchTerm.length >= this.minSearchTermLength) {
        // Display spinner until results are returned
        this.loading = true;

        this.dispatchEvent(
          new CustomEvent("search", {
            detail: {
              searchTerm: this.cleanSearchTerm,
              rawSearchTerm: newSearchTerm,
              selectedIds: this.value.map(({ id }) => id)
            }
          })
        );
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

  processSelectionUpdate(isUserInteraction) {
    // Reset search
    this.cleanSearchTerm = "";
    this.searchTerm = "";
    this.setSearchResults(this.defaultSearchResults);

    // If selection was changed by user, notify parent components
    if (isUserInteraction) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: this.value.map(({ id }) => id) }
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

    if (event.keyCode === KEY_INPUTS.KEY_ESCAPE) {
      // Reset search
      this.processSelectionUpdate(true);
      // Blur input after single select lookup selection
      if (!this.isMultiEntry && this.hasSelection) {
        this.hasFocus = false;
      }
    }
    if (event.keyCode === KEY_INPUTS.ARROW_DOWN) {
      // If we hit 'down', select the next item, or cycle over.
      this.focusedResultIndex++;
      if (this.focusedResultIndex >= this.searchResults.length) {
        this.focusedResultIndex = 0;
      }
      event.preventDefault();
    } else if (event.keyCode === KEY_INPUTS.ARROW_UP) {
      // If we hit 'up', select the previous item, or cycle over.
      this.focusedResultIndex--;
      if (this.focusedResultIndex < 0) {
        this.focusedResultIndex = this.searchResults.length - 1;
      }
      event.preventDefault();
    } else if (
      event.keyCode === KEY_INPUTS.ENTER &&
      this.hasFocus &&
      this.focusedResultIndex >= 0
    ) {
      // If the user presses enter, and the box is open, and we have used arrows,
      // treat this just like a click on the listbox item
      const { id } = this.searchResults[this.focusedResultIndex];
      this.template.querySelector(`[data-item-id="${id}"]`).click();
      event.preventDefault();
    }

    if (
      event.keyCode === KEY_INPUTS.ARROW_DOWN ||
      event.keyCode === KEY_INPUTS.ARROW_UP
    ) {
      const focusedElement = this.template.querySelector(
        `[data-item-id="${this.searchResults[this.focusedResultIndex].id}"]`
      );

      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
  }

  handleResultClick(event) {
    const recordId = event.currentTarget.dataset.itemId;

    // Save selection
    const selectedItem = this.searchResults.find(({ id }) => id === recordId);

    if (!selectedItem) {
      return;
    }

    this.setValue([...this.value, selectedItem]);

    // Process selection update
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
    // Re-focus to text input for the next blur event
    this.inputElement.focus();
  }

  handleFocus() {
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
    this.setValue(this.value.filter(({ id }) => id !== recordId));
    // Process selection update
    this.processSelectionUpdate(true);

    if (!this.hasSelection) {
      this.focus();
    }
  }

  setValue(value) {
    if (Array.isArray(value)) {
      this._value = clone(value);
    } else if (value) {
      this._value = [clone(value)];
    } else {
      this._value = [];
    }
  }

  handleClearSelection() {
    this.setValue();
    this.hasFocus = false;
    // Process selection update
    this.processSelectionUpdate(true);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.focus();
  }

  handleActionClick(event) {
    const name = event.currentTarget.dataset.name;
    this.dispatchEvent(new CustomEvent("action", { detail: name }));
  }

  connectedCallback() {
    this.classList.add("slds-form-element");
    this.updateClassList();
  }

  updateClassList() {
    classListMutation(this.classList, {
      "slds-form-element_stacked": this.variant === VARIANTS.LABEL_STACKED,
      "slds-form-element_horizontal": this.variant === VARIANTS.LABEL_INLINE
    });
  }
}

export { KEY_INPUTS, VARIANTS, LABELS, MIN_SEARCH_TERM_LENGTH };
