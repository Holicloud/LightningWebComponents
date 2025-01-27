import { LightningElement, api } from "lwc";

export const COMPONENTS = {
  "lightning/formattedAddress": {
    builder: () => import("lightning/formattedAddress")
  },
  "lightning/formattedDateTime": {
    builder: () => import("lightning/formattedDateTime")
  },
  "lightning/formattedEmail": {
    builder: () => import("lightning/formattedEmail")
  },
  "lightning/formattedLocation": {
    builder: () => import("lightning/formattedLocation")
  },
  "lightning/formattedName": {
    builder: () => import("lightning/formattedName")
  },
  "lightning/formattedNumber": {
    builder: () => import("lightning/formattedNumber")
  },
  "lightning/formattedPhone": {
    builder: () => import("lightning/formattedPhone")
  },
  "lightning/formattedRichText": {
    builder: () => import("lightning/formattedRichText")
  },
  "lightning/formattedText": {
    builder: () => import("lightning/formattedText")
  },
  "lightning/formattedTime": {
    builder: () => import("lightning/formattedTime")
  },
  "lightning/formattedUrl": {
    builder: () => import("lightning/formattedUrl")
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
  component;
  type = "lightning/formattedText";
  props = {};

  @api subtitle = {};

  async connectedCallback() {
    const { subtitleType, ...props } = this.subtitle;
    delete props?.subtitleLabel;
    this.type = subtitleType;
    this.props = props;

    if (COMPONENTS[this.type]) {
      try {
        const { default: ComponentCtor } =
          await COMPONENTS[this.type].builder();
        this.component = ComponentCtor;
      } catch (error) {
        console.error(`Error loading component for type ${this.type}:`, error);
      }
    } else {
      const { default: ComponentCtor } = await import(this.type);
      this.component = ComponentCtor;
    }
  }

  get componentProps() {
    const baseProps = COMPONENTS[this.type].baseProps || {};
    return {
      ...baseProps,
      ...this.props
    };
  }
}
