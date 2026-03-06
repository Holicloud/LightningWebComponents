import { LightningElement, track } from "lwc";
import {
  validateExpression,
  evaluateExpression
} from "c/booleanExpressionEngine";

export default class BooleanExpressionEngineBasic extends LightningElement {
  expression = "NOT(1 OR 2) AND 3";

  isValidExpression = true;

  handleExpresssionChange(event) {
    this.expression = event.detail.value;
    this.validateInput();
  }

  get isValid() {
    if (!this.isValidExpression) {
      return false;
    }
    // get the values in this format [true, true, false, true]
    const evaluations = this.options.map(
      (option) => !!this.selected.includes(option.value)
    );
    return evaluateExpression(evaluations, this.expression);
  }

  selected = ["2"];

  @track options = [
    { label: "Condition Number 1", value: "0" },
    { label: "Condition Number 2", value: "1" },
    { label: "Condition Number 3", value: "2" }
  ];

  addOption() {
    const nextIndex = this.options.length + 1;
    this.options = [
      ...this.options,
      {
        label: "Condition Number " + nextIndex,
        value: "" + nextIndex
      }
    ];
    this.validateInput();
  }

  validateInput() {
    const { valid, message } = validateExpression(
      this.expression,
      this.options.length
    );

    this.isValidExpression = valid;

    this.refs.input.setCustomValidity(!this.isValidExpression ? message : "");
    this.refs.input.reportValidity();
  }

  removeOption() {
    if (this.options.length <= 3) {
      return;
    }

    this.options = this.options.slice(0, -1);
    this.validateInput();
  }

  handleChecboxGroupChange(event) {
    this.selected = event.detail.value;
  }
}
