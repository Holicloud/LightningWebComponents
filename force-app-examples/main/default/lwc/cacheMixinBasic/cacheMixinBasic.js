import { CacheMixin } from "c/cacheMixin";
import { LightningElement, api, track } from "lwc";

export default class CacheMixinBasic extends CacheMixin(LightningElement, {
  componentName: "cacheMixinBasic",
  cacheable: ["inputValue", "emailValue", "phoneValue"],
  expirationTime: 5,
  storage: "session"
}) {
  @api cacheId = "uniqueIdentifier";
  @track isCacheOn = true;
  @track logs = [];

  emailValue = "";
  inputValue = "";
  isCacheHit = false;
  phoneValue = "";

  get isCacheEnabled() {
    return this.isCacheOn;
  }

  get statusLabel() {
    return this.isCacheHit ? "Cache Hit" : "No Cache";
  }

  get statusVariant() {
    return this.isCacheHit ? "success" : "light";
  }

  _log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs = [
      { id: Date.now(), text: `[${timestamp}] ${message}` },
      ...this.logs
    ];
  }

  handleClearCache() {
    this[CacheMixin.Clear]();
    this.inputValue = "";
    this.emailValue = "";
    this.phoneValue = "";
    this.isCacheHit = false;
    this._log("Manually cleared cache.");
  }

  handleInputChange(event) {
    const field = event.target.name;
    this[field] = event.detail.value;
    this.isCacheHit = false;
  }

  handleToggleCache(event) {
    this.isCacheOn = event.target.checked;
    if (this.isCacheOn) {
      this[CacheMixin.Enable]();
    } else {
      this[CacheMixin.Disable]();
    }
    this._log(`Cache ${this.isCacheOn ? "Enabled" : "Disabled"}`);
  }

  connectedCallback() {
    // Cache is now enabled by default (isCacheDisabled = false)
    // Register error handler
    this[CacheMixin.OnError]((error) => {
      this._log(`ERROR: ${error.message}`);
    });

    this[CacheMixin.SetUniqueIdentifier](this.cacheId);

    const previousValue = this.inputValue;
    this[CacheMixin.Config]();

    if (this.inputValue && this.inputValue !== previousValue) {
      this.isCacheHit = true;
      this._log("Restored state from session cache.");
    } else {
      this._log("No valid cache found or cache disabled.");
    }
  }
}
