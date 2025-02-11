import { CacheMixin } from "c/cacheMixin";
import { LightningElement, track } from "lwc";

export default class CacheMixinLocal extends CacheMixin(LightningElement, {
  componentName: "cacheMixinLocal",
  cacheable: ["notes", "priority"],
  expirationTime: 1440, // 24 hours
  storage: "local"
}) {
  @track logs = [];

  notes = "";
  priority = "Normal";

  get isCacheEnabled() {
    return !this.isCacheDisabled;
  }

  get options() {
    return [
      { label: "High", value: "High" },
      { label: "Normal", value: "Normal" },
      { label: "Low", value: "Low" }
    ];
  }

  get statusLabel() {
    return this.notes || this.priority !== "Normal"
      ? "Persistent Data"
      : "Empty";
  }

  _log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs = [
      { id: Date.now(), text: `[${timestamp}] ${message}` },
      ...this.logs
    ];
  }

  handleClear() {
    this[CacheMixin.Clear]();
    this.notes = "";
    this.priority = "Normal";
    this._log("Cleared local storage.");
  }

  handleInputChange(event) {
    this[event.target.name] = event.detail.value;
  }

  handleToggleCache(event) {
    this.isCacheDisabled = !event.target.checked;
    this._log(
      `Persistent Storage ${this.isCacheDisabled ? "Disabled" : "Enabled"}`
    );
  }

  connectedCallback() {
    this[CacheMixin.Config]();
    if (this.notes || this.priority !== "Normal") {
      this._log("Restored from Local Storage (survives tab closing).");
    }
  }
}
