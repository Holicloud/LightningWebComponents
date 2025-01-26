import { LightningElement, api } from "lwc";

export const COMPONENTS = {
  "lightning-formatted-number": {
    builder: () => import("lightning/formattedNumber")
  },
  "lightning-formatted-text": {
    builder: () => import("lightning/formattedText")
  },
  "lightning-formatted-time": {
    builder: () => import("lightning/formattedTime")
  },
  "lightning-formatted-date-time": {
    builder: () => import("lightning/formattedDateTime")
  },
  "lightning-formatted-email": {
    builder: () => import("lightning/formattedEmail")
  },
  "lightning-formatted-url": {
    builder: () => import("lightning/formattedUrl")
  },
  "lightning-formatted-rich-text": {
    builder: () => import("lightning/formattedRichText")
  },
  "lightning-icon": {
    builder: () => import("lightning/icon"),
    baseProps: {
      iconName: "utility:check",
      size: "xx-small"
    }
  }
};

export default class LightningFormattedDynamicOutput extends LightningElement {
  @api type = "lightning-formatted-rich-text";
  @api value;
  @api props = {};

  component;

  async connectedCallback() {
    if (COMPONENTS[this.type]) {
      try {
        const { default: ComponentCtor } =
          await COMPONENTS[this.type].builder();
        this.component = ComponentCtor;
      } catch (error) {
        console.error(`Error loading component for type ${this.type}:`, error);
      }
    }
  }

  get componentProps() {
    const baseProps = COMPONENTS[this.type].baseProps || {};
    return {
      ...baseProps,
      ...this.props,
      value: this.value
    };
  }
}
