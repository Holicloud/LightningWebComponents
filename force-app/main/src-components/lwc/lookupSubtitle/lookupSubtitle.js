import { LightningElement, api } from "lwc";

export const COMPONENTS = {
  "lightning/formattedPhone": {
    builder: () => import("lightning/formattedPhone")
  },
  "lightning/formattedName": {
    builder: () => import("lightning/formattedName")
  },
  "lightning/formattedLocation": {
    builder: () => import("lightning/formattedLocation")
  },
  "lightning/formattedAddress": {
    builder: () => import("lightning/formattedAddress")
  },
  "lightning/formattedNumber": {
    builder: () => import("lightning/formattedNumber")
  },
  "lightning/formattedText": {
    builder: () => import("lightning/formattedText")
  },
  "lightning/formattedTime": {
    builder: () => import("lightning/formattedTime")
  },
  "lightning/formattedDateTime": {
    builder: () => import("lightning/formattedDateTime")
  },
  "lightning/formattedEmail": {
    builder: () => import("lightning/formattedEmail")
  },
  "lightning/formattedUrl": {
    builder: () => import("lightning/formattedUrl")
  },
  "lightning/formattedRichText": {
    builder: () => import("lightning/formattedRichText")
  },
  "lightning/icon": {
    builder: () => import("lightning/icon"),
    baseProps: {
      iconName: "utility:check",
      size: "xx-small"
    }
  }
};

export default class LookupSubtitle extends LightningElement {
  @api type = "lightning/formattedRichText";
  @api props = {};

  component;

  async connectedCallback() {
    if (COMPONENTS[this.type]) {
      const { default: ComponentCtor } =
        await COMPONENTS[this.type].builder();
      this.component = ComponentCtor;
    } else {
      const { default: ComponentCtor } = await import(this.type);
      this.component = ComponentCtor;
    }
  }

  get componentProps() {
    const baseProps = COMPONENTS[this.type]?.baseProps || {};
    return {
      ...baseProps,
      ...this.props
    };
  }
}
